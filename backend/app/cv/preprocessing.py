from pathlib import Path
import cv2
import numpy as np


def load_image(path: str | Path) -> np.ndarray:
    image = cv2.imread(str(path))
    if image is None:
        raise ValueError(f"Unable to read image: {path}")
    return image


def preprocess_image(image: np.ndarray, size: tuple[int, int] = (300, 300)) -> np.ndarray:
    resized = cv2.resize(image, size)
    denoised = cv2.fastNlMeansDenoisingColored(resized, None, 10, 10, 7, 21)
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = cv2.merge((clahe.apply(l_channel), a_channel, b_channel))
    corrected = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    return corrected.astype(np.float32) / 255.0
