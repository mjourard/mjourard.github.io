package models

import (
	"time"
)

type PageLoad struct {
	HashedUserID          string    `json:"HashedUserID"`
	UrlLoaded             string    `json:"UrlLoaded"`
	Referrer              string    `json:"Referrer"`
	XForwardedFor         string    `json:"XForwardedFor"`
	ScreenWidth           int64     `json:"ScreenWidth"`
	ScreenHeight          int64     `json:"ScreenHeight"`
	UserAgent             string    `json:"UserAgent"`
	LoadUnixTimestamp     int64     `json:"LoadUnixTimestamp"`
	LoadReadableTimestamp time.Time `json:"LoadReadableTimestamp"`
}
