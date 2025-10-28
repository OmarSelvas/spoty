import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'spotify_token';
  private readonly EXPIRY_KEY = 'spotify_token_expiry';
  
  isAuthenticated = signal(false);
  accessToken = signal<string | null>(null);

  constructor(private router: Router) {
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() < expiryTime) {
        this.accessToken.set(token);
        this.isAuthenticated.set(true);
      } else {
        this.logout();
      }
    }
  }

  login(): void {
    const codeVerifier = this.generateCodeVerifier();
    localStorage.setItem('code_verifier', codeVerifier);

    this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
      const authUrl = new URL('https://accounts.spotify.com/authorize');
      
      const params = {
        client_id: environment.spotifyClientId,
        response_type: 'code',
        redirect_uri: environment.spotifyRedirectUri,
        scope: environment.spotifyScopes,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      };

      authUrl.search = new URLSearchParams(params).toString();
      window.location.href = authUrl.toString();
    });
  }

  async handleCallback(code: string): Promise<void> {
    const codeVerifier = localStorage.getItem('code_verifier');
    
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: environment.spotifyClientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: environment.spotifyRedirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();
    
    if (data.access_token) {
      const expiryTime = Date.now() + (data.expires_in * 1000);
      
      localStorage.setItem(this.TOKEN_KEY, data.access_token);
      localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
      localStorage.removeItem('code_verifier');
      
      this.accessToken.set(data.access_token);
      this.isAuthenticated.set(true);
      
      this.router.navigate(['/player']);
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
    this.accessToken.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(hash));
  }

  private base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}