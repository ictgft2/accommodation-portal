# Settings package for Accommodation Portal
from .base import *

# Import the appropriate settings based on environment
try:
    from .local import *
except ImportError:
    pass
