import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

class PDFService:
    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes) -> str:
        """
        Extracts and validates raw text from an in-memory PDF byte stream.
        Raises ValueError for invalid, empty, or unextractable PDFs.
        """
        if not pdf_bytes or len(pdf_bytes) == 0:
            raise ValueError("Uploaded file is empty (0 bytes).")
            
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        except Exception as e:
            logger.error(f"Failed to open PDF binary stream: {e}")
            raise ValueError(f"Failed to parse PDF format: {str(e)}")
            
        try:
            if doc.is_encrypted:
                raise ValueError("PDF is encrypted or password-protected. Please upload an unlocked PDF.")
                
            if len(doc) == 0:
                raise ValueError("PDF has 0 pages.")

            text = ""
            for page_num, page in enumerate(doc, 1):
                page_text = page.get_text()
                text += page_text

            doc.close()
            
            # Post extraction validation
            cleaned_text = text.strip()
            if not cleaned_text:
                raise ValueError(
                    "No extractable text found in PDF. The document might be an un-OCRed scanned image, "
                    "or empty. Please upload a text-based PDF resume."
                )
                
            return text
        except ValueError:
            doc.close()
            raise
        except Exception as e:
            doc.close()
            logger.error(f"Unexpected error extracting PDF bytes: {e}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    @staticmethod
    def extract_text_from_file(file_path: str) -> str:
        """
        Extracts and validates raw text from a local PDF file path.
        """
        try:
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            return PDFService.extract_text_from_bytes(pdf_bytes)
        except ValueError:
            raise
        except FileNotFoundError:
            raise ValueError(f"PDF file not found at path: {file_path}")
        except Exception as e:
            logger.error(f"Failed to read PDF file '{file_path}': {e}")
            raise ValueError(f"Failed to read PDF file: {str(e)}")
