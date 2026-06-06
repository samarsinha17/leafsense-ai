import cv2
import numpy as np


def segment_leaf(image: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower_green = np.array([25, 20, 20])
    upper_green = np.array([100, 255, 255])
    mask = cv2.inRange(hsv, lower_green, upper_green)
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    segmented = cv2.bitwise_and(image, image, mask=mask)
    return segmented, mask
