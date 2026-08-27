package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Database Models
type Institusi struct {
	NPSN               string    `gorm:"primaryKey"`
	Nama               string
	Alamat             string
	Kelurahan          string
	Status             string
	Kota               string
	Lat                float64
	Lng                float64
	Akreditasi         string
	KepalaSekolahNama  string
	KepalaSekolahEmail string
	KepalaSekolahHp    string
	KontakEmail        string
	KontakTelepon      string
	Jurusans           []Jurusan `gorm:"foreignKey:InstitusiNPSN"`
}

type Jurusan struct {
	ID            uint `gorm:"primaryKey;autoIncrement"`
	InstitusiNPSN string
	Nama          string
	KajurNama     string
	KajurEmail    string
	KajurHp       string
}

// JSON Structures
type JSONKepalaSekolah struct {
	Nama  string `json:"nama"`
	Email string `json:"email"`
	Hp    string `json:"hp"`
}

type JSONKontak struct {
	Email   string `json:"email"`
	Telepon string `json:"telepon"`
}

type JSONKajur struct {
	Nama  string `json:"nama"`
	Email string `json:"email"`
	Hp    string `json:"hp"`
}

type JSONJurusan struct {
	Nama  string    `json:"nama"`
	Kajur JSONKajur `json:"kajur"`
}

type JSONInstitusi struct {
	NPSN          string            `json:"npsn"`
	Nama          string            `json:"nama"`
	Alamat        string            `json:"alamat"`
	Kelurahan     string            `json:"kelurahan"`
	Status        string            `json:"status"`
	Kota          string            `json:"kota"`
	Lat           float64           `json:"lat"`
	Lng           float64           `json:"lng"`
	Akreditasi    string            `json:"akreditasi"`
	KepalaSekolah JSONKepalaSekolah `json:"kepala_sekolah"`
	Kontak        JSONKontak        `json:"kontak"`
	Jurusan       []JSONJurusan     `json:"jurusan"`
}

func main() {
	// Database connection string based on user provided credentials
	dsn := "host=localhost user=crmacad password=crmacad_44 dbname=crmacad_db port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Gagal terhubung ke database: %v", err)
	}

	fmt.Println("Berhasil terhubung ke database PostgreSQL")

	// Auto Migrate the schema
	err = db.AutoMigrate(&Institusi{}, &Jurusan{})
	if err != nil {
		log.Fatalf("Gagal melakukan migrasi tabel: %v", err)
	}
	fmt.Println("Migrasi tabel selesai")

	// Read JSON file
	jsonFile := "../scripts/enriched_schools.json"
	data, err := os.ReadFile(jsonFile)
	if err != nil {
		log.Fatalf("Gagal membaca file %s: %v", jsonFile, err)
	}

	var jsonInstitusis []JSONInstitusi
	err = json.Unmarshal(data, &jsonInstitusis)
	if err != nil {
		log.Fatalf("Gagal melakukan unmarshal JSON: %v", err)
	}

	fmt.Printf("Ditemukan %d institusi di JSON. Memulai proses import...\n", len(jsonInstitusis))

	// Begin import
	for _, ji := range jsonInstitusis {
		var jurusans []Jurusan
		for _, jj := range ji.Jurusan {
			jurusans = append(jurusans, Jurusan{
				Nama:       jj.Nama,
				KajurNama:  jj.Kajur.Nama,
				KajurEmail: jj.Kajur.Email,
				KajurHp:    jj.Kajur.Hp,
			})
		}

		inst := Institusi{
			NPSN:               ji.NPSN,
			Nama:               ji.Nama,
			Alamat:             ji.Alamat,
			Kelurahan:          ji.Kelurahan,
			Status:             ji.Status,
			Kota:               ji.Kota,
			Lat:                ji.Lat,
			Lng:                ji.Lng,
			Akreditasi:         ji.Akreditasi,
			KepalaSekolahNama:  ji.KepalaSekolah.Nama,
			KepalaSekolahEmail: ji.KepalaSekolah.Email,
			KepalaSekolahHp:    ji.KepalaSekolah.Hp,
			KontakEmail:        ji.Kontak.Email,
			KontakTelepon:      ji.Kontak.Telepon,
			Jurusans:           jurusans,
		}

		// Save or update (upsert based on primary key)
		result := db.Clauses(clause.OnConflict{
			UpdateAll: true,
		}).Create(&inst)
		if result.Error != nil {
			log.Printf("Gagal menyimpan Institusi %s: %v", ji.NPSN, result.Error)
		}
	}

	fmt.Println("Proses import selesai!")
}
