from app.training.dataset_loader import LeafDatasetLoader


def test_dataset_loader_handles_missing_dataset(tmp_path):
    loader = LeafDatasetLoader(str(tmp_path / "dataset"))
    summary = loader.summarize()
    assert summary.status == "awaiting_dataset"
    assert summary.train == 0
