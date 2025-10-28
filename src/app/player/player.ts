// src/app/player/player.ts
import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { SpotifyService, SpotifyPlaylist, SpotifyTrack } from '../services/spotify.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player',
  imports: [CommonModule, FormsModule],
  templateUrl: './player.html',
  styleUrl: './player.css',
})
export class Player implements OnInit {
  volume = signal(50);
  showPlaylists = signal(true);
  selectedPlaylist = signal<SpotifyPlaylist | null>(null);

  constructor(
    public authService: AuthService,
    public spotifyService: SpotifyService
  ) {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadData();
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadData();
      // Actualizar estado cada 5 segundos
      setInterval(() => {
        if (this.authService.isAuthenticated()) {
          this.spotifyService.getCurrentPlayback();
        }
      }, 5000);
    }
  }

  async loadData(): Promise<void> {
    await this.spotifyService.getUserPlaylists();
    await this.spotifyService.getCurrentPlayback();
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }

  async selectPlaylist(playlist: SpotifyPlaylist): Promise<void> {
    this.selectedPlaylist.set(playlist);
    await this.spotifyService.getPlaylistTracks(playlist.id);
    this.showPlaylists.set(false);
  }

  backToPlaylists(): void {
    this.showPlaylists.set(true);
    this.selectedPlaylist.set(null);
  }

  async playTrack(track: SpotifyTrack): Promise<void> {
    await this.spotifyService.play(track.uri);
  }

  async togglePlay(): Promise<void> {
    if (this.spotifyService.isPlaying()) {
      await this.spotifyService.pause();
    } else {
      await this.spotifyService.play();
    }
  }

  async nextTrack(): Promise<void> {
    await this.spotifyService.next();
  }

  async previousTrack(): Promise<void> {
    await this.spotifyService.previous();
  }

  async onVolumeChange(event: Event): Promise<void> {
    const value = (event.target as HTMLInputElement).value;
    this.volume.set(parseInt(value));
    await this.spotifyService.setVolume(this.volume());
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}