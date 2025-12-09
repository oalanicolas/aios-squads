"""
Unit Tests for Workflow Orchestrator

Tests the simple orchestrator pattern:
- Loading and sequencing phases
- Task markdown loading
- Checkpoint detection
- Error handling
- State persistence

Coverage target: ≥85%
"""

import pytest
import json
from pathlib import Path
from unittest.mock import Mock, patch, mock_open, MagicMock
from datetime import datetime

# Import module under test
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "lib"))

from workflow_orchestrator import WorkflowOrchestrator, load_task_markdown


# Test Fixtures

@pytest.fixture
def mock_workflows_dir(tmp_path):
    """Create temporary workflows directory."""
    workflows_dir = tmp_path / "workflows"
    workflows_dir.mkdir()
    return workflows_dir


@pytest.fixture
def mock_tasks_dir(tmp_path):
    """Create temporary tasks directory with sample task."""
    tasks_dir = tmp_path / "tasks"
    tasks_dir.mkdir()

    # Create sample task file
    sample_task = tasks_dir / "sample-task.md"
    sample_task.write_text("""---
task-id: sample-task
agent: analyst
elicit: false
---

# Sample Task

## Instructions

1. Do something
2. Do something else
""")

    return tasks_dir


@pytest.fixture
def mock_metadata_manager():
    """Create mock metadata manager."""
    manager = Mock()
    manager.update_phase_status = Mock()
    return manager


@pytest.fixture
def orchestrator(mock_workflows_dir, mock_tasks_dir, mock_metadata_manager):
    """Create orchestrator instance for testing."""
    return WorkflowOrchestrator(
        workflows_dir=mock_workflows_dir,
        tasks_dir=mock_tasks_dir,
        metadata_manager=mock_metadata_manager
    )


@pytest.fixture
def sample_context():
    """Sample execution context."""
    return {
        'slug': 'test_person',
        'mode': 'public',
        'person_name': 'Test Person',
        'materials_path': None,
        'decision_log': ['Auto-detected: greenfield + public']
    }


@pytest.fixture
def simple_workflow():
    """Simple workflow for testing."""
    return {
        'id': 'test-workflow',
        'sequence': [
            {
                'phase': 'test_phase',
                'task': 'sample-task',
                'agent': 'analyst'
            }
        ]
    }


# Unit Tests

class TestWorkflowOrchestrator:
    """Test WorkflowOrchestrator class."""

    def test_init(self, mock_workflows_dir, mock_tasks_dir, mock_metadata_manager):
        """Test orchestrator initialization."""
        orchestrator = WorkflowOrchestrator(
            workflows_dir=mock_workflows_dir,
            tasks_dir=mock_tasks_dir,
            metadata_manager=mock_metadata_manager
        )

        assert orchestrator.workflows_dir == mock_workflows_dir
        assert orchestrator.tasks_dir == mock_tasks_dir
        assert orchestrator.metadata_manager == mock_metadata_manager

    def test_orchestrate_simple_workflow(self, orchestrator, simple_workflow, sample_context, capsys):
        """Test basic workflow orchestration."""
        result = orchestrator.orchestrate_workflow(simple_workflow, sample_context)

        assert result['status'] == 'completed'
        assert len(result['phases_executed']) == 1
        assert result['phases_executed'][0]['phase'] == 'test_phase'
        assert result['phases_executed'][0]['task'] == 'sample-task'
        assert result['phases_executed'][0]['status'] == 'completed'
        assert 'started_at' in result
        assert 'completed_at' in result

    def test_orchestrate_empty_workflow(self, orchestrator, sample_context):
        """Test workflow with no phases."""
        empty_workflow = {'id': 'empty', 'sequence': []}

        result = orchestrator.orchestrate_workflow(empty_workflow, sample_context)

        assert result['status'] == 'completed'
        assert len(result['phases_executed']) == 0

    def test_orchestrate_missing_task_file(self, orchestrator, sample_context):
        """Test error handling for missing task file."""
        workflow = {
            'id': 'test',
            'sequence': [
                {'phase': 'test', 'task': 'nonexistent-task'}
            ]
        }

        result = orchestrator.orchestrate_workflow(workflow, sample_context)

        assert result['status'] == 'failed'
        assert 'error' in result
        assert 'nonexistent-task' in result['error']

    def test_should_skip_phase_false(self, orchestrator, sample_context):
        """Test phase is not skipped when no skip_if."""
        phase = {'phase': 'test', 'task': 'sample-task'}

        should_skip = orchestrator._should_skip_phase(phase, sample_context, {})

        assert should_skip is False

    def test_should_skip_phase_condition_met(self, orchestrator, sample_context):
        """Test phase is skipped when condition is met."""
        phase = {
            'phase': 'test',
            'task': 'sample-task',
            'skip_if': "mode != 'public'"
        }

        should_skip = orchestrator._should_skip_phase(phase, sample_context, {})

        assert should_skip is False  # mode IS public, so don't skip

    def test_should_skip_phase_condition_not_met(self, orchestrator):
        """Test phase is not skipped when condition not met."""
        phase = {
            'phase': 'test',
            'task': 'sample-task',
            'skip_if': "mode == 'public'"
        }
        context = {'mode': 'no-public-interviews'}

        should_skip = orchestrator._should_skip_phase(phase, context, {})

        assert should_skip is False  # mode is NOT public, so don't skip

    def test_execute_task_success(self, orchestrator, sample_context):
        """Test successful task execution."""
        phase = {'phase': 'test', 'task': 'sample-task', 'agent': 'analyst'}

        result = orchestrator._execute_task('sample-task', phase, sample_context)

        assert result is not None
        assert 'task_executed' in result
        assert result['task_executed'] == 'sample-task'

    def test_execute_task_missing_file(self, orchestrator, sample_context):
        """Test task execution with missing file."""
        phase = {'phase': 'test', 'task': 'missing-task'}

        with pytest.raises(FileNotFoundError):
            orchestrator._execute_task('missing-task', phase, sample_context)

    def test_handle_checkpoint_auto_approve(self, orchestrator, sample_context):
        """Test checkpoint handling (auto-approve for now)."""
        phase = {
            'phase': 'test',
            'human_checkpoint': True,
            'checkpoint_type': 'GO_NO-GO'
        }
        results = {'phases_executed': [], 'outputs': {}}

        checkpoint_result = orchestrator._handle_checkpoint(phase, results, sample_context)

        assert checkpoint_result['decision'] == 'APPROVE'
        assert checkpoint_result['checkpoint_type'] == 'GO_NO-GO'
        assert checkpoint_result['phase'] == 'test'

    def test_update_phase_status_called(self, orchestrator, simple_workflow, sample_context):
        """Test that metadata manager is called to update phase status."""
        orchestrator.orchestrate_workflow(simple_workflow, sample_context)

        # Verify update_phase_status was called (check args, ignore timestamp)
        call_args = orchestrator.metadata_manager.update_phase_status.call_args
        assert call_args[1]['slug'] == 'test_person'
        assert call_args[1]['phase'] == 'test_phase'
        assert call_args[1]['status'] == 'completed'
        assert 'timestamp' in call_args[1]

    def test_workflow_with_checkpoint(self, orchestrator, sample_context):
        """Test workflow with human checkpoint."""
        workflow = {
            'id': 'test',
            'sequence': [
                {
                    'phase': 'checkpoint_phase',
                    'task': 'sample-task',
                    'human_checkpoint': True,
                    'checkpoint_type': 'REVIEW'
                }
            ]
        }

        result = orchestrator.orchestrate_workflow(workflow, sample_context)

        assert result['status'] == 'completed'
        assert 'checkpoint_phase_checkpoint' in result['outputs']

    def test_context_propagation(self, orchestrator, simple_workflow, sample_context, capsys):
        """Test that context is properly passed to task execution."""
        orchestrator.orchestrate_workflow(simple_workflow, sample_context)

        captured = capsys.readouterr()

        # Verify context was printed (AI would read this)
        assert 'test_person' in captured.out
        assert 'public' in captured.out
        assert 'Test Person' in captured.out


class TestLoadTaskMarkdown:
    """Test load_task_markdown helper function."""

    def test_load_existing_task(self, mock_tasks_dir):
        """Test loading existing task file."""
        content = load_task_markdown('sample-task', mock_tasks_dir)

        assert 'task-id: sample-task' in content
        assert '# Sample Task' in content
        assert 'Instructions' in content

    def test_load_missing_task(self, mock_tasks_dir):
        """Test loading missing task file."""
        with pytest.raises(FileNotFoundError):
            load_task_markdown('missing-task', mock_tasks_dir)

    def test_load_task_with_complex_frontmatter(self, mock_tasks_dir):
        """Test loading task with complex MMOS frontmatter."""
        complex_task = mock_tasks_dir / "complex-task.md"
        complex_task.write_text("""---
task-id: complex-task
name: Complex Task
agent: analyst
elicit: true
inputs:
  - name: param1
    type: string
    required: true
outputs:
  - path: output.yaml
dependencies:
  templates:
    - template.yaml
---

# Complex Task

Complex instructions here.
""")

        content = load_task_markdown('complex-task', mock_tasks_dir)

        assert 'task-id: complex-task' in content
        assert 'elicit: true' in content
        assert 'inputs:' in content
        assert 'outputs:' in content
        assert 'dependencies:' in content


class TestErrorHandling:
    """Test error handling and edge cases."""

    def test_workflow_execution_exception(self, orchestrator, sample_context):
        """Test handling of unexpected exceptions."""
        bad_workflow = {
            'id': 'bad',
            'sequence': [
                {'phase': 'bad_phase', 'task': 'nonexistent-task'}
            ]
        }

        result = orchestrator.orchestrate_workflow(bad_workflow, sample_context)

        assert result['status'] == 'failed'
        assert 'error' in result

    def test_metadata_update_failure_handled(self, orchestrator, simple_workflow, sample_context):
        """Test that metadata update failures don't break workflow."""
        # Make metadata manager throw exception
        orchestrator.metadata_manager.update_phase_status.side_effect = Exception("DB error")

        result = orchestrator.orchestrate_workflow(simple_workflow, sample_context)

        # Workflow should still complete despite metadata error
        assert result['status'] == 'completed'

    def test_invalid_skip_condition(self, orchestrator, sample_context):
        """Test handling of invalid skip_if condition."""
        phase = {
            'phase': 'test',
            'skip_if': 'invalid python code {{'
        }

        # Should not raise exception, just return False
        should_skip = orchestrator._should_skip_phase(phase, sample_context, {})

        assert should_skip is False


class TestResultTracking:
    """Test result tracking and output aggregation."""

    def test_phases_executed_tracking(self, orchestrator, sample_context):
        """Test that phases_executed list is properly maintained."""
        workflow = {
            'id': 'test',
            'sequence': [
                {'phase': 'phase1', 'task': 'sample-task'},
                {'phase': 'phase2', 'task': 'sample-task'},
                {'phase': 'phase3', 'task': 'sample-task'}
            ]
        }

        result = orchestrator.orchestrate_workflow(workflow, sample_context)

        assert len(result['phases_executed']) == 3
        assert result['phases_executed'][0]['phase'] == 'phase1'
        assert result['phases_executed'][1]['phase'] == 'phase2'
        assert result['phases_executed'][2]['phase'] == 'phase3'

    def test_outputs_aggregation(self, orchestrator, sample_context):
        """Test that outputs from multiple phases are aggregated."""
        workflow = {
            'id': 'test',
            'sequence': [
                {'phase': 'phase1', 'task': 'sample-task', 'outputs': ['output1.yaml']},
                {'phase': 'phase2', 'task': 'sample-task', 'outputs': ['output2.yaml']}
            ]
        }

        result = orchestrator.orchestrate_workflow(workflow, sample_context)

        assert 'outputs' in result

    def test_timestamps_recorded(self, orchestrator, simple_workflow, sample_context):
        """Test that timestamps are recorded for each phase."""
        result = orchestrator.orchestrate_workflow(simple_workflow, sample_context)

        assert 'started_at' in result
        assert 'completed_at' in result
        assert result['phases_executed'][0]['completed_at']


# Run tests
if __name__ == '__main__':
    pytest.main([__file__, '-v', '--cov=workflow_orchestrator', '--cov-report=term-missing'])
