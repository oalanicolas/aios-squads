"""
Tests for MMOS Metadata Manager

Part of MMOS-E001 Story 4: Metadata & State Management
"""

import os
import sys
import shutil
import pytest
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from lib.metadata_manager import (
    create_metadata,
    update_pipeline_status,
    append_workflow_execution,
    read_metadata,
    update_statistics,
    update_fidelity,
    get_pipeline_status,
    is_greenfield,
    VALID_STATUSES
)


# Test fixtures
TEST_SLUG = "test_mind"
TEST_OUTPUTS_DIR = "expansion-packs/mmos/minds/test_mind"


@pytest.fixture(autouse=True)
def cleanup():
    """Clean up test outputs before and after each test"""
    if os.path.exists(TEST_OUTPUTS_DIR):
        shutil.rmtree(TEST_OUTPUTS_DIR)
    yield
    if os.path.exists(TEST_OUTPUTS_DIR):
        shutil.rmtree(TEST_OUTPUTS_DIR)


def test_metadata_creation():
    """
    AC1: Test metadata.yaml auto-creation
    GIVEN *map {slug} inicia greenfield workflow
    WHEN Phase 0 (initialization) executa
    THEN expansion-packs/mmos/minds/{slug}/metadata.yaml é criado automaticamente
    """
    # Execute
    create_metadata(TEST_SLUG, "public", "Test Person")

    # Assert file exists
    metadata_path = f"{TEST_OUTPUTS_DIR}/metadata.yaml"
    assert os.path.exists(metadata_path), "metadata.yaml should be created"

    # Assert content
    metadata = read_metadata(TEST_SLUG)
    assert metadata is not None, "Should be able to read metadata"
    assert metadata['mind']['slug'] == TEST_SLUG
    assert metadata['mind']['name'] == "Test Person"
    assert metadata['mind']['source_type'] == "public"
    assert metadata['mind']['pipeline_status'] == "not_started"
    assert metadata['mind']['current_version'] == "v1.0"
    assert metadata['mind']['fidelity'] is None
    assert metadata['workflow_history'] == []
    assert metadata['statistics']['total_sources'] == 0
    assert metadata['statistics']['total_kb_chunks'] == 0
    assert metadata['statistics']['total_executions'] == 0


def test_metadata_creation_auto_name():
    """Test that name is auto-generated from slug if not provided"""
    create_metadata("pedro_valerio", "public")

    metadata = read_metadata("pedro_valerio")
    assert metadata['mind']['name'] == "Pedro Valerio"

    # Cleanup
    shutil.rmtree("expansion-packs/mmos/minds/pedro_valerio")


def test_read_nonexistent_metadata():
    """
    AC1: Test reading metadata when it doesn't exist
    GIVEN metadata.yaml não existe
    WHEN sistema tenta ler
    THEN assume greenfield (não falha)
    """
    # Execute
    metadata = read_metadata("nonexistent_mind")

    # Assert returns None (doesn't crash)
    assert metadata is None


def test_pipeline_status_updates():
    """
    AC3: Test pipeline_status tracking
    GIVEN workflow progride de fase
    WHEN cada fase completa
    THEN pipeline_status atualiza corretamente
    """
    # Setup
    create_metadata(TEST_SLUG, "public")

    # Execute - progress through phases
    update_pipeline_status(TEST_SLUG, "viability")
    assert get_pipeline_status(TEST_SLUG) == "viability"

    update_pipeline_status(TEST_SLUG, "research")
    assert get_pipeline_status(TEST_SLUG) == "research"

    update_pipeline_status(TEST_SLUG, "analysis")
    assert get_pipeline_status(TEST_SLUG) == "analysis"

    update_pipeline_status(TEST_SLUG, "completed")
    assert get_pipeline_status(TEST_SLUG) == "completed"


def test_pipeline_status_invalid():
    """Test that invalid status raises error"""
    create_metadata(TEST_SLUG, "public")

    with pytest.raises(ValueError):
        update_pipeline_status(TEST_SLUG, "invalid_status")


def test_workflow_history_append():
    """
    AC4: Test workflow_history versionamento
    GIVEN workflow executa
    WHEN workflow completa
    THEN entrada é adicionada a workflow_history[]
    """
    # Setup
    create_metadata(TEST_SLUG, "public")

    # Execute - append greenfield execution
    append_workflow_execution(TEST_SLUG, {
        'workflow': 'greenfield-mind',
        'mode': 'public',
        'version': 'v1.0',
        'status': 'completed',
        'duration_hours': 10,
        'tokens_used': 2000000,
        'phases_completed': ['viability', 'research', 'analysis', 'synthesis', 'implementation', 'testing']
    })

    # Assert
    metadata = read_metadata(TEST_SLUG)
    assert len(metadata['workflow_history']) == 1
    assert metadata['workflow_history'][0]['workflow'] == 'greenfield-mind'
    assert metadata['workflow_history'][0]['mode'] == 'public'
    assert metadata['workflow_history'][0]['version'] == 'v1.0'
    assert metadata['workflow_history'][0]['status'] == 'completed'
    assert 'execution_id' in metadata['workflow_history'][0]
    assert 'timestamp' in metadata['workflow_history'][0]

    # Verify version updated
    assert metadata['mind']['current_version'] == 'v1.0'
    assert metadata['statistics']['total_executions'] == 1


def test_workflow_history_multiple_appends():
    """
    AC4: Test brownfield updates append (not overwrite)
    GIVEN brownfield update executa
    WHEN update completa
    THEN nova entrada é appended (não sobrescreve histórico)
    """
    # Setup
    create_metadata(TEST_SLUG, "no-public-interviews")

    # First execution (greenfield)
    append_workflow_execution(TEST_SLUG, {
        'workflow': 'greenfield-mind',
        'mode': 'no-public-interviews',
        'version': 'v1.0',
        'status': 'completed',
        'duration_hours': 18,
        'tokens_used': 1850000,
        'phases_completed': ['viability', 'research', 'analysis', 'synthesis', 'implementation', 'testing']
    })

    # Second execution (brownfield)
    append_workflow_execution(TEST_SLUG, {
        'workflow': 'brownfield-mind',
        'mode': 'no-public-incremental',
        'version': 'v1.1',
        'status': 'completed',
        'duration_hours': 3,
        'tokens_used': 450000,
        'changes': ['Added new interview session', 'Updated Layer 7'],
        'phases_completed': ['assessment', 'research', 'analysis', 'synthesis', 'implementation', 'validation']
    })

    # Assert both entries exist
    metadata = read_metadata(TEST_SLUG)
    assert len(metadata['workflow_history']) == 2
    assert metadata['workflow_history'][0]['version'] == 'v1.0'
    assert metadata['workflow_history'][1]['version'] == 'v1.1'
    assert metadata['mind']['current_version'] == 'v1.1'
    assert metadata['statistics']['total_executions'] == 2


def test_brownfield_context_aware():
    """
    AC5: Test brownfield reads metadata correctly
    GIVEN *map {slug} executa em brownfield
    WHEN auto-detection lê metadata.yaml
    THEN extrai source_type e usa para determinar mode correto
    """
    # Setup
    create_metadata(TEST_SLUG, "no-public-interviews", "Test Person")
    update_pipeline_status(TEST_SLUG, "completed")

    # Execute (simulate brownfield reading metadata)
    metadata = read_metadata(TEST_SLUG)

    # Assert brownfield can extract context
    assert metadata is not None
    assert metadata['mind']['source_type'] == "no-public-interviews"
    assert metadata['mind']['pipeline_status'] == "completed"


def test_update_statistics():
    """Test updating statistics"""
    create_metadata(TEST_SLUG, "public")

    update_statistics(TEST_SLUG, sources=7, kb_chunks=48)

    metadata = read_metadata(TEST_SLUG)
    assert metadata['statistics']['total_sources'] == 7
    assert metadata['statistics']['total_kb_chunks'] == 48


def test_update_fidelity():
    """Test updating fidelity scores"""
    create_metadata(TEST_SLUG, "public")

    update_fidelity(TEST_SLUG, overall=96, personality=98, knowledge=95, style=95)

    metadata = read_metadata(TEST_SLUG)
    assert metadata['mind']['fidelity']['overall'] == 96
    assert metadata['mind']['fidelity']['personality'] == 98
    assert metadata['mind']['fidelity']['knowledge'] == 95
    assert metadata['mind']['fidelity']['style'] == 95


def test_is_greenfield():
    """Test greenfield detection"""
    # Nonexistent mind = greenfield
    assert is_greenfield("nonexistent_mind") is True

    # New mind with not_started status = greenfield
    create_metadata(TEST_SLUG, "public")
    assert is_greenfield(TEST_SLUG) is True

    # Mind with progress = brownfield
    update_pipeline_status(TEST_SLUG, "completed")
    assert is_greenfield(TEST_SLUG) is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
