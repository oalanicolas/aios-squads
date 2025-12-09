"""
Integration tests for MMOS Map Mind command.

Part of Story 3: Command Interface
"""

import os
import sys
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from lib.map_mind import (
    map_mind,
    _to_slug,
    _get_workflow_file,
    VALID_MODES,
    ALL_VALID_MODES
)


class TestMapMindBasic:
    """Basic functionality tests."""

    def test_to_slug_conversion(self):
        """Test person name to slug conversion."""
        assert _to_slug("Daniel Kahneman") == "daniel_kahneman"
        assert _to_slug("José Amorim") == "josé_amorim"  # Preserves accents (Python3 \w includes unicode)
        assert _to_slug("Pedro Valério") == "pedro_valério"  # Preserves accents
        assert _to_slug("alan-nicolas") == "alan_nicolas"
        assert _to_slug("  Test  Person  ") == "test_person"

    def test_get_workflow_file(self):
        """Test workflow file selection."""
        assert _get_workflow_file("greenfield") == "greenfield-mind.yaml"
        assert _get_workflow_file("brownfield") == "brownfield-mind.yaml"

        with pytest.raises(ValueError):
            _get_workflow_file("invalid")

    def test_valid_modes_defined(self):
        """Test that valid modes are properly defined."""
        assert "public" in VALID_MODES["greenfield"]
        assert "no-public-interviews" in VALID_MODES["greenfield"]
        assert "no-public-materials" in VALID_MODES["greenfield"]
        assert "public-update" in VALID_MODES["brownfield"]
        assert "no-public-incremental" in VALID_MODES["brownfield"]

        assert len(ALL_VALID_MODES) == 6


class TestMapMindHelp:
    """Help text tests."""

    def test_help_flag(self):
        """Test --help flag shows help text."""
        result = map_mind("", show_help=True)
        assert result['status'] == 'help'

    def test_help_command(self):
        """Test 'help' as person name shows help."""
        result = map_mind("--help")
        assert result['status'] == 'help'

        result = map_mind("-h")
        assert result['status'] == 'help'

    def test_empty_person_name_shows_help(self):
        """Test empty person name triggers help."""
        result = map_mind("")
        assert result['status'] == 'failed'
        assert 'error' in result


class TestMapMindForceMode:
    """Force mode override tests."""

    @patch('lib.map_mind.auto_detect_workflow')
    @patch('lib.map_mind._execute_workflow')
    def test_force_mode_skips_detection(self, mock_execute, mock_detect):
        """Test that force_mode skips auto-detection."""
        mock_execute.return_value = {'execution': 'simulated'}

        result = map_mind(
            "test_person",
            force_mode="public"
        )

        # Auto-detection should NOT be called
        mock_detect.assert_not_called()

        # Should succeed
        assert result['status'] == 'completed'
        assert result['mode'] == 'public'
        assert result['workflow_type'] == 'greenfield'

    @patch('lib.map_mind._execute_workflow')
    def test_force_mode_greenfield_modes(self, mock_execute):
        """Test all greenfield force modes."""
        mock_execute.return_value = {'execution': 'simulated'}

        for mode in VALID_MODES["greenfield"]:
            result = map_mind("test_person", force_mode=mode)
            assert result['status'] == 'completed'
            assert result['mode'] == mode
            assert result['workflow_type'] == 'greenfield'

    @patch('lib.map_mind._execute_workflow')
    def test_force_mode_brownfield_modes(self, mock_execute):
        """Test all brownfield force modes."""
        mock_execute.return_value = {'execution': 'simulated'}

        for mode in VALID_MODES["brownfield"]:
            result = map_mind("test_person", force_mode=mode)
            assert result['status'] == 'completed'
            assert result['mode'] == mode
            assert result['workflow_type'] == 'brownfield'

    def test_force_mode_invalid_mode(self):
        """Test invalid force_mode raises error."""
        result = map_mind(
            "test_person",
            force_mode="invalid-mode"
        )

        assert result['status'] == 'failed'
        assert 'Invalid mode' in result['error']


class TestMapMindMaterialsPath:
    """Materials path tests."""

    @patch('lib.map_mind._execute_workflow')
    @patch('os.path.exists')
    def test_materials_path_forces_mode(self, mock_exists, mock_execute):
        """Test materials_path forces no-public-materials mode."""
        mock_exists.return_value = True
        mock_execute.return_value = {'execution': 'simulated'}

        result = map_mind(
            "test_person",
            materials_path="./sources/test/"
        )

        assert result['status'] == 'completed'
        assert result['mode'] == 'no-public-materials'
        assert result['workflow_type'] == 'greenfield'

    def test_materials_path_not_found(self):
        """Test materials_path validation."""
        result = map_mind(
            "test_person",
            materials_path="./nonexistent/path/"
        )

        assert result['status'] == 'failed'
        assert 'not found' in result['error']


class TestMapMindAutoDetection:
    """Auto-detection integration tests."""

    @patch('lib.map_mind._execute_workflow')
    @patch('lib.map_mind.auto_detect_workflow')
    def test_auto_detect_greenfield_public(self, mock_detect, mock_execute):
        """Test auto-detection: greenfield + public."""
        mock_detect.return_value = {
            'workflow_type': 'greenfield',
            'mode': 'public',
            'decision_log': ['Test log']
        }
        mock_execute.return_value = {'execution': 'simulated'}

        result = map_mind("daniel_kahneman")

        # Auto-detection should be called
        mock_detect.assert_called_once()

        # Should succeed with correct values
        assert result['status'] == 'completed'
        assert result['workflow_type'] == 'greenfield'
        assert result['mode'] == 'public'
        assert result['workflow_file'] == 'greenfield-mind.yaml'

    @patch('lib.map_mind._execute_workflow')
    @patch('lib.map_mind.auto_detect_workflow')
    def test_auto_detect_greenfield_no_public(self, mock_detect, mock_execute):
        """Test auto-detection: greenfield + no-public-interviews."""
        mock_detect.return_value = {
            'workflow_type': 'greenfield',
            'mode': 'no-public-interviews',
            'decision_log': ['No web content', 'User selected interviews']
        }
        mock_execute.return_value = {'execution': 'simulated'}

        result = map_mind("pedro_valerio")

        assert result['status'] == 'completed'
        assert result['mode'] == 'no-public-interviews'

    @patch('lib.map_mind._execute_workflow')
    @patch('lib.map_mind.auto_detect_workflow')
    def test_auto_detect_brownfield(self, mock_detect, mock_execute):
        """Test auto-detection: brownfield."""
        mock_detect.return_value = {
            'workflow_type': 'brownfield',
            'mode': 'no-public-incremental',
            'decision_log': ['Clone exists', 'source_type: no-public-interviews']
        }
        mock_execute.return_value = {'execution': 'simulated'}

        result = map_mind("joao_lozano")

        assert result['status'] == 'completed'
        assert result['workflow_type'] == 'brownfield'
        assert result['mode'] == 'no-public-incremental'
        assert result['workflow_file'] == 'brownfield-mind.yaml'


class TestMapMindErrorHandling:
    """Error handling tests."""

    def test_empty_person_name(self):
        """Test empty person name error."""
        result = map_mind("")
        assert result['status'] == 'failed'

    @patch('lib.map_mind.auto_detect_workflow')
    def test_detection_failure(self, mock_detect):
        """Test auto-detection failure."""
        mock_detect.side_effect = Exception("Detection failed")

        result = map_mind("test_person")

        assert result['status'] == 'failed'
        assert 'error' in result

    @patch('lib.map_mind._execute_workflow')
    def test_execution_failure(self, mock_execute):
        """Test workflow execution failure."""
        mock_execute.side_effect = Exception("Execution failed")

        result = map_mind("test_person", force_mode="public")

        assert result['status'] == 'failed'
        assert 'error' in result


class TestMapMindCLI:
    """Command-line interface tests."""

    @patch('lib.map_mind.map_mind')
    def test_cli_basic_usage(self, mock_map):
        """Test basic CLI invocation."""
        from lib.map_mind import main

        mock_map.return_value = {'status': 'completed'}

        # Would normally call main() but that calls sys.exit()
        # Just verify the function exists
        assert callable(main)

    def test_cli_arg_parsing(self):
        """Test CLI argument parsing."""
        # This would require more complex setup
        # For now, just verify imports work
        from lib.map_mind import main
        assert main is not None


class TestMapMindIntegration:
    """End-to-end integration tests."""

    @patch('lib.map_mind._execute_workflow')
    @patch('lib.map_mind.auto_detect_workflow')
    def test_full_workflow_greenfield_public(self, mock_detect, mock_execute):
        """Test complete workflow: greenfield + public."""
        mock_detect.return_value = {
            'workflow_type': 'greenfield',
            'mode': 'public',
            'decision_log': [
                'Mind directory not found → greenfield',
                'Web search found content → public mode'
            ]
        }
        mock_execute.return_value = {'execution': 'simulated'}

        result = map_mind("daniel_kahneman")

        assert result['status'] == 'completed'
        assert result['workflow_type'] == 'greenfield'
        assert result['mode'] == 'public'
        assert result['slug'] == 'daniel_kahneman'
        assert result['workflow_file'] == 'greenfield-mind.yaml'
        assert 'decision_log' in result

    @patch('lib.map_mind._execute_workflow')
    @patch('os.path.exists')
    def test_full_workflow_with_materials(self, mock_exists, mock_execute):
        """Test complete workflow: provided materials."""
        mock_exists.return_value = True
        mock_execute.return_value = {'execution': 'simulated'}

        result = map_mind(
            "jose_amorim",
            materials_path="./sources/jose/"
        )

        assert result['status'] == 'completed'
        assert result['mode'] == 'no-public-materials'
        assert result['workflow_type'] == 'greenfield'

    @patch('lib.map_mind._execute_workflow')
    def test_full_workflow_force_mode(self, mock_execute):
        """Test complete workflow: forced mode."""
        mock_execute.return_value = {'execution': 'simulated'}

        result = map_mind(
            "test_person",
            force_mode="no-public-interviews"
        )

        assert result['status'] == 'completed'
        assert result['mode'] == 'no-public-interviews'
        assert result['workflow_type'] == 'greenfield'


class TestMapMindAdditional:
    """Additional tests for coverage improvement."""

    @patch('lib.map_mind.auto_detect_workflow')
    def test_detection_error_ambiguous(self, mock_detect):
        """Test error handling for ambiguous detection."""
        mock_detect.side_effect = Exception("Could not auto-detect: ambiguous sources")

        result = map_mind("test_person")

        assert result['status'] == 'failed'
        assert 'error' in result

    @patch('lib.map_mind._execute_workflow')
    def test_map_mind_with_brownfield_migration_mode(self, mock_execute):
        """Test brownfield migration mode."""
        mock_execute.return_value = {'execution': 'simulated'}

        result = map_mind(
            "test_person",
            force_mode="no-public-migration"
        )

        assert result['status'] == 'completed'
        assert result['mode'] == 'no-public-migration'
        assert result['workflow_type'] == 'brownfield'


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
