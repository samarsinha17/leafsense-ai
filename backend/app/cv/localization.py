import cv2
import numpy as np


def create_disease_heatmap(image: np.ndarray, mask: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 80, 160)
    affected = cv2.bitwise_and(edges, edges, mask=mask)
    heatmap = cv2.applyColorMap(affected, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(image, 0.72, heatmap, 0.28, 0)
    return heatmap, overlay
