package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.POST("/convert", func(c *gin.Context) {
		file, err := c.FormFile("document")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File tidak ditemukan dalam request"})
			return
		}

		// Buat temporary directory
		tmpDir, err := os.MkdirTemp("", "docx-to-pdf-*")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat temporary directory"})
			return
		}
		defer os.RemoveAll(tmpDir) // Clean up setelah selesai

		docxPath := filepath.Join(tmpDir, "input.docx")
		if err := c.SaveUploadedFile(file, docxPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file DOCX"})
			return
		}

		// Eksekusi libreoffice
		cmd := exec.Command("soffice", "--headless", "--convert-to", "pdf", "--outdir", tmpDir, docxPath)
		output, err := cmd.CombinedOutput()
		if err != nil {
			log.Printf("LibreOffice error: %v\nOutput: %s", err, string(output))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengonversi file dengan LibreOffice"})
			return
		}

		pdfPath := filepath.Join(tmpDir, "input.pdf")
		if _, err := os.Stat(pdfPath); os.IsNotExist(err) {
			log.Printf("PDF tidak ditemukan di: %s\nOutput: %s", pdfPath, string(output))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "PDF gagal di-generate"})
			return
		}

		pdfData, err := os.ReadFile(pdfPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membaca file PDF hasil konversi"})
			return
		}

		c.Header("Content-Type", "application/pdf")
		c.Header("Content-Disposition", `attachment; filename="output.pdf"`)
		c.Data(http.StatusOK, "application/pdf", pdfData)
	})

	fmt.Println("=== Backend Konversi DOCX to PDF Berjalan di http://localhost:8080 ===")
	r.Run(":8080")
}
