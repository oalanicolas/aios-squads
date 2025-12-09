"""
Tests for MMOS Workflow Detector

Part of MMOS-E001 Story 1: Auto-Detection Engine
"""

import os
import sys
import shutil
import pytest
from unittest.mock import patch, MagicMock

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from lib.workflow_detector import (
    auto_detect_workflow,
    detect_workflow_type,
    detect_greenfield_mode,
    detect_brownfield_mode,
    quick_web_search,
    clear_cache,
    _has_files
)
from lib.metadata_manager import create_metadata, update_pipeline_status


# Test fixtures
TEST_SLUG = "test_person"
TEST_NAME = "Test Person"
TEST_OUTPUTS_DIR = "expansion-packs/mmos/minds/test_person"


@pytest.fixture(autouse=True)
def cleanup():
    """Clean up test outputs before and after each test"""
    if os.path.exists(TEST_OUTPUTS_DIR):
        shutil.rmtree(TEST_OUTPUTS_DIR)
    clear_cache()
    yield
    if os.path.exists(TEST_OUTPUTS_DIR):
        shutil.rmtree(TEST_OUTPUTS_DIR)
    clear_cache()


def test_detect_workflow_type_greenfield_no_directory():
    """
    AC1: Test greenfield detection when directory doesn't exist
    GIVEN expansion-packs/mmos/minds/{slug}/ não existe
    WHEN *map {slug} é executado
    THEN sistema detecta workflow_type = "greenfield"
    """
    decision_log = []

    workflow_type = detect_workflow_type(TEST_SLUG, decision_log)

    assert workflow_type == "greenfield"
    assert any("Mind directory not found" in log for log in decision_log)


def test_detect_workflow_type_greenfield_no_metadata():
    """
    AC1: Test greenfield detection when metadata.yaml doesn't exist
    GIVEN expansion-packs/mmos/minds/{slug}/metadata.yaml não existe
    WHEN *map {slug} é executado
    THEN sistema detecta workflow_type = "greenfield" (continuar interrompido)
    """
    # Setup: create directory without metadata
    os.makedirs(TEST_OUTPUTS_DIR, exist_ok=True)

    decision_log = []
    workflow_type = detect_workflow_type(TEST_SLUG, decision_log)

    assert workflow_type == "greenfield"
    assert any("metadata.yaml missing" in log for log in decision_log)


def test_detect_workflow_type_greenfield_incomplete():
    """
    AC1: Test greenfield detection when pipeline is incomplete
    GIVEN metadata.yaml existe AND pipeline_status < "completed"
    WHEN *map {slug} é executado
    THEN sistema detecta workflow_type = "greenfield" (continuar em progresso)
    """
    # Setup: create metadata with incomplete status
    create_metadata(TEST_SLUG, "public", TEST_NAME)
    update_pipeline_status(TEST_SLUG, "analysis")  # Not completed

    decision_log = []
    workflow_type = detect_workflow_type(TEST_SLUG, decision_log)

    assert workflow_type == "greenfield"
    assert any("incomplete" in log for log in decision_log)


def test_detect_workflow_type_brownfield():
    """
    AC1: Test brownfield detection when pipeline is completed
    GIVEN metadata.yaml existe AND pipeline_status == "completed"
    WHEN *map {slug} é executado
    THEN sistema detecta workflow_type = "brownfield"
    """
    # Setup: create completed metadata
    create_metadata(TEST_SLUG, "public", TEST_NAME)
    update_pipeline_status(TEST_SLUG, "completed")

    decision_log = []
    workflow_type = detect_workflow_type(TEST_SLUG, decision_log)

    assert workflow_type == "brownfield"
    assert any("completed" in log and "brownfield" in log for log in decision_log)


@patch('lib.workflow_detector.quick_web_search')
def test_detect_greenfield_mode_public(mock_search):
    """
    AC2: Test public mode detection with web search success
    GIVEN workflow_type == "greenfield" AND quick web search encontra conteúdo
    WHEN auto-detection executa
    THEN mode = "public"
    """
    mock_search.return_value = True

    decision_log = []
    mode = detect_greenfield_mode(TEST_SLUG, TEST_NAME, decision_log)

    assert mode == "public"
    assert any("public mode" in log for log in decision_log)
    mock_search.assert_called_once()


@patch('lib.workflow_detector.quick_web_search')
def test_detect_greenfield_mode_no_public_materials(mock_search):
    """
    AC2: Test no-public-materials detection
    GIVEN workflow_type == "greenfield" AND web search não encontra AND sources/ tem arquivos
    WHEN auto-detection executa
    THEN mode = "no-public-materials"
    """
    mock_search.return_value = False

    # Setup: create sources directory with files
    sources_path = f"{TEST_OUTPUTS_DIR}/sources/"
    os.makedirs(sources_path, exist_ok=True)
    with open(f"{sources_path}/interview1.md", 'w') as f:
        f.write("Test interview content")

    decision_log = []
    mode = detect_greenfield_mode(TEST_SLUG, TEST_NAME, decision_log)

    assert mode == "no-public-materials"
    assert any("no-public-materials" in log for log in decision_log)


@patch('lib.workflow_detector.quick_web_search')
@patch('builtins.input', return_value='1')
def test_detect_greenfield_mode_interviews_user_input(mock_input, mock_search):
    """
    AC2: Test user selection for interviews
    GIVEN workflow_type == "greenfield" AND web search não encontra AND sources/ vazio
    WHEN auto-detection executa
    THEN sistema PERGUNTA ao usuário e mode = "no-public-interviews"
    """
    mock_search.return_value = False

    decision_log = []
    mode = detect_greenfield_mode(TEST_SLUG, TEST_NAME, decision_log)

    assert mode == "no-public-interviews"
    assert any("User selected" in log and "interviews" in log for log in decision_log)
    mock_input.assert_called_once()


@patch('lib.workflow_detector.quick_web_search')
@patch('builtins.input', return_value='2')
def test_detect_greenfield_mode_materials_user_input(mock_input, mock_search):
    """
    AC2: Test user selection for materials
    GIVEN user selects materials option
    THEN mode = "no-public-materials"
    """
    mock_search.return_value = False

    decision_log = []
    mode = detect_greenfield_mode(TEST_SLUG, TEST_NAME, decision_log)

    assert mode == "no-public-materials"
    assert any("User selected" in log and "materials" in log for log in decision_log)


def test_detect_brownfield_mode_public_update():
    """
    AC3: Test brownfield public-update mode
    GIVEN workflow_type == "brownfield" AND source_type == "public"
    WHEN brownfield mode é determinado
    THEN mode = "public-update"
    """
    # Setup
    create_metadata(TEST_SLUG, "public", TEST_NAME)
    update_pipeline_status(TEST_SLUG, "completed")

    decision_log = []
    mode = detect_brownfield_mode(TEST_SLUG, decision_log)

    assert mode == "public-update"
    assert any("public-update" in log for log in decision_log)


def test_detect_brownfield_mode_no_public_incremental_interviews():
    """
    AC3: Test brownfield no-public-incremental mode (interviews)
    GIVEN source_type == "no-public-interviews"
    WHEN brownfield mode é determinado
    THEN mode = "no-public-incremental"
    """
    # Setup
    create_metadata(TEST_SLUG, "no-public-interviews", TEST_NAME)
    update_pipeline_status(TEST_SLUG, "completed")

    decision_log = []
    mode = detect_brownfield_mode(TEST_SLUG, decision_log)

    assert mode == "no-public-incremental"
    assert any("no-public-incremental" in log for log in decision_log)


def test_detect_brownfield_mode_no_public_incremental_materials():
    """
    AC3: Test brownfield no-public-incremental mode (materials)
    GIVEN source_type == "no-public-materials"
    WHEN brownfield mode é determinado
    THEN mode = "no-public-incremental"
    """
    # Setup
    create_metadata(TEST_SLUG, "no-public-materials", TEST_NAME)
    update_pipeline_status(TEST_SLUG, "completed")

    decision_log = []
    mode = detect_brownfield_mode(TEST_SLUG, decision_log)

    assert mode == "no-public-incremental"
    assert any("no-public-incremental" in log for log in decision_log)


@patch('lib.workflow_detector.requests.get')
def test_quick_web_search_success(mock_get):
    """
    Test web search with successful API response
    """
    # Mock successful DuckDuckGo response
    mock_response = MagicMock()
    mock_response.json.return_value = {
        'Abstract': 'Test Person is a notable figure...',
        'AbstractText': 'Biography text...',
        'RelatedTopics': ['Topic 1', 'Topic 2']
    }
    mock_response.raise_for_status = MagicMock()
    mock_get.return_value = mock_response

    result = quick_web_search("Test Person")

    assert result is True
    mock_get.assert_called_once()


@patch('lib.workflow_detector.requests.get')
def test_quick_web_search_no_results(mock_get):
    """
    Test web search with no results
    """
    # Mock empty DuckDuckGo response
    mock_response = MagicMock()
    mock_response.json.return_value = {
        'Abstract': '',
        'AbstractText': '',
        'RelatedTopics': []
    }
    mock_response.raise_for_status = MagicMock()
    mock_get.return_value = mock_response

    result = quick_web_search("Unknown Person")

    assert result is False


@patch('lib.workflow_detector.requests.get')
def test_quick_web_search_api_failure(mock_get):
    """
    Test web search fallback when API fails
    """
    # Mock API failure
    mock_get.side_effect = Exception("API unavailable")

    result = quick_web_search("Test Person")

    # Should fallback gracefully
    assert result is False


def test_has_files_with_files():
    """Test _has_files() returns True when directory has files"""
    # Setup
    test_dir = f"{TEST_OUTPUTS_DIR}/test_dir"
    os.makedirs(test_dir, exist_ok=True)
    with open(f"{test_dir}/file.txt", 'w') as f:
        f.write("test")

    assert _has_files(test_dir) is True


def test_has_files_empty_directory():
    """Test _has_files() returns False for empty directory"""
    # Setup
    test_dir = f"{TEST_OUTPUTS_DIR}/empty_dir"
    os.makedirs(test_dir, exist_ok=True)

    assert _has_files(test_dir) is False


def test_has_files_nonexistent_directory():
    """Test _has_files() returns False for nonexistent directory"""
    assert _has_files("nonexistent/path") is False


@patch('lib.workflow_detector.quick_web_search')
def test_auto_detect_workflow_full_greenfield_public(mock_search):
    """
    Integration test: Full auto-detection for greenfield public
    """
    mock_search.return_value = True

    result = auto_detect_workflow(TEST_SLUG, TEST_NAME)

    assert result['workflow_type'] == "greenfield"
    assert result['mode'] == "public"
    assert len(result['decision_log']) > 0


def test_auto_detect_workflow_full_brownfield():
    """
    Integration test: Full auto-detection for brownfield
    """
    # Setup: create completed mind
    create_metadata(TEST_SLUG, "no-public-interviews", TEST_NAME)
    update_pipeline_status(TEST_SLUG, "completed")

    result = auto_detect_workflow(TEST_SLUG, TEST_NAME)

    assert result['workflow_type'] == "brownfield"
    assert result['mode'] == "no-public-incremental"
    assert len(result['decision_log']) > 0


def test_cache_functionality():
    """Test that web search results are cached"""
    with patch('lib.workflow_detector.requests.get') as mock_get:
        mock_response = MagicMock()
        mock_response.json.return_value = {'Abstract': 'Test'}
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        # First call
        result1 = quick_web_search("Cache Test")
        assert result1 is True
        assert mock_get.call_count == 1

        # Second call (should use cache)
        result2 = quick_web_search("Cache Test")
        assert result2 is True
        assert mock_get.call_count == 1  # Not called again


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
