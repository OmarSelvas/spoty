// src/app/callback/temp.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-callback',
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="loading">
        <div class="spinner"></div>
        <p>Conectando con Spotify...</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #1DB954 0%, #191414 100%);
    }

    .loading {
      text-align: center;
      color: white;
    }

    .spinner {
      width: 50px;
      height: 50px;
      margin: 0 auto 20px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    p {
      font-size: 18px;
      font-family: 'Segoe UI', sans-serif;
    }
  `]
})
export class Callback implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.authService.handleCallback(code);
      }
    });
  }
}