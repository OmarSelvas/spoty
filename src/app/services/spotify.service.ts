// src/app/services/spotify.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, firstValueFrom } from 'rxjs';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: {
    total: number;
  };
}

export interface PlaybackState {
  is_playing: boolean;
  item: SpotifyTrack;
  progress_ms: number;
  device: {
    id: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private readonly API_URL = 'https://api.spotify.com/v1';
  
  currentTrack = signal<SpotifyTrack | null>(null);
  isPlaying = signal(false);
  playlists = signal<SpotifyPlaylist[]>([]);
  currentPlaylist = signal<SpotifyPlaylist | null>(null);
  playlistTracks = signal<SpotifyTrack[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  async getUserPlaylists(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${this.API_URL}/me/playlists`, {
          headers: this.getHeaders()
        })
      );
      this.playlists.set(response.items);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  }

  async getPlaylistTracks(playlistId: string): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${this.API_URL}/playlists/${playlistId}/tracks`, {
          headers: this.getHeaders()
        })
      );
      const tracks = response.items.map((item: any) => item.track);
      this.playlistTracks.set(tracks);
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
    }
  }

  async getCurrentPlayback(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${this.API_URL}/me/player`, {
          headers: this.getHeaders()
        })
      );
      
      if (response && response.item) {
        this.currentTrack.set(response.item);
        this.isPlaying.set(response.is_playing);
      }
    } catch (error) {
      console.error('Error fetching playback state:', error);
    }
  }

  async play(uri?: string): Promise<void> {
    try {
      const body = uri ? { uris: [uri] } : {};
      await firstValueFrom(
        this.http.put(`${this.API_URL}/me/player/play`, body, {
          headers: this.getHeaders()
        })
      );
      this.isPlaying.set(true);
      setTimeout(() => this.getCurrentPlayback(), 500);
    } catch (error) {
      console.error('Error playing:', error);
    }
  }

  async pause(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put(`${this.API_URL}/me/player/pause`, {}, {
          headers: this.getHeaders()
        })
      );
      this.isPlaying.set(false);
    } catch (error) {
      console.error('Error pausing:', error);
    }
  }

  async next(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/me/player/next`, {}, {
          headers: this.getHeaders()
        })
      );
      setTimeout(() => this.getCurrentPlayback(), 500);
    } catch (error) {
      console.error('Error skipping to next:', error);
    }
  }

  async previous(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/me/player/previous`, {}, {
          headers: this.getHeaders()
        })
      );
      setTimeout(() => this.getCurrentPlayback(), 500);
    } catch (error) {
      console.error('Error skipping to previous:', error);
    }
  }

  async setVolume(volume: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put(`${this.API_URL}/me/player/volume?volume_percent=${volume}`, {}, {
          headers: this.getHeaders()
        })
      );
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  async seek(position: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put(`${this.API_URL}/me/player/seek?position_ms=${position}`, {}, {
          headers: this.getHeaders()
        })
      );
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }
}