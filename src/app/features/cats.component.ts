import {
  Component, signal, inject, OnInit, computed
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CatApiService } from '../core/services/cat-api.service';
import { Cat, CreateCatDto } from '../core/models/cat.model';

// ── Detail Dialog ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cat-detail',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule, MatChipsModule, MatIconModule],
  template: `
    <div class="detail">
      @if (cat()) {
        <div class="detail-hero">
          <div class="hero-bg"></div>
          <div class="hero-emoji">🐱</div>
          <button mat-icon-button class="close-btn" (click)="ref.close()">
            <mat-icon>close</mat-icon>
          </button>
          <div class="hero-name">{{ cat()!.name }}</div>
        </div>
        <mat-dialog-content class="detail-content">
          <div class="detail-badge">
            <span class="badge-icon">🎂</span>
            <span class="badge-text">{{ cat()!.age }} years old</span>
          </div>
          <p class="detail-desc">{{ cat()!.description }}</p>
          <div class="detail-id">
            <span class="id-label">CAT ID</span>
            <span class="id-value">{{ cat()!.id }}</span>
          </div>
        </mat-dialog-content>
        <mat-dialog-actions align="end" class="detail-actions">
          <button mat-button (click)="ref.close()">Close</button>
        </mat-dialog-actions>
      }
    </div>
  `,
  styles: [`
    .detail { min-width: 360px; overflow: hidden; }

    .detail-hero {
      position: relative;
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #1a0533, #0d1f4a, #1a0533);
      background-size: 400% 400%;
      animation: gradientShift 6s ease infinite;
    }

    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .hero-emoji {
      font-size: 5rem;
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 0 20px rgba(167,139,250,0.8));
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-8px); }
    }

    .hero-name {
      position: relative;
      z-index: 1;
      color: white;
      font-size: 1.4rem;
      font-weight: 700;
      margin-top: 8px;
      font-family: 'Playfair Display', serif;
    }

    .close-btn {
      position: absolute !important;
      top: 12px; right: 12px;
      color: rgba(255,255,255,0.7) !important;
      z-index: 2;
    }

    .detail-content { padding: 24px !important; }

    .detail-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(96,165,250,0.15));
      border: 1px solid rgba(167,139,250,0.3);
      border-radius: 999px;
      padding: 6px 16px;
      margin-bottom: 16px;
    }

    .badge-icon { font-size: 1rem; }
    .badge-text { font-size: 0.85rem; color: #7c3aed; font-weight: 600; }

    .detail-desc {
      font-size: 0.92rem;
      color: #6b7280;
      line-height: 1.7;
      margin: 0 0 20px;
    }

    .detail-id {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .id-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: #9ca3af;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .id-value {
      font-size: 0.75rem;
      font-family: monospace;
      color: #374151;
      word-break: break-all;
    }

    .detail-actions {
      padding: 8px 16px !important;
      border-top: 1px solid #f3f4f6;
    }
  `],
})
export class CatDetailComponent {
  readonly ref = inject(MatDialogRef<CatDetailComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { cat: Cat };
  readonly cat = signal<Cat | null>(this.data.cat);
}

// ── Form Dialog ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cat-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatIconModule,
  ],
  template: `
    <div class="form-dialog">
      <div class="form-header">
        <span class="form-header-icon">{{ data.mode === 'create' ? '🐱' : '✏️' }}</span>
        <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New Cat' : 'Edit Cat' }}</h2>
        <p>{{ data.mode === 'create' ? 'Register a new feline companion' : 'Update cat details' }}</p>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="form">

          <div class="field-wrap">
            <label class="field-label">Cat Name *</label>
            <mat-form-field appearance="outline" class="full">
              <input matInput formControlName="name" placeholder="e.g. Whiskers"/>
              @if (form.controls['name'].invalid && form.controls['name'].touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="field-wrap">
            <label class="field-label">Age *</label>
            <mat-form-field appearance="outline" class="full">
              <input matInput formControlName="age" placeholder="e.g. 3"/>
              @if (form.controls['age'].invalid && form.controls['age'].touched) {
                <mat-error>Age is required</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="field-wrap">
            <label class="field-label">Description *</label>
            <mat-form-field appearance="outline" class="full">
              <textarea matInput formControlName="description" rows="4"
                placeholder="Tell us about this cat's personality…"></textarea>
              @if (form.controls['description'].invalid && form.controls['description'].touched) {
                <mat-error>Description is required</mat-error>
              }
            </mat-form-field>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="form-actions">
        <button mat-button (click)="ref.close()">Cancel</button>
        <button mat-flat-button class="save-btn"
          [disabled]="form.invalid || saving()" (click)="save()">
          @if (saving()) {
            <mat-spinner diameter="18"/>
          } @else {
            <mat-icon>{{ data.mode === 'create' ? 'add' : 'save' }}</mat-icon>
            {{ data.mode === 'create' ? 'Add Cat' : 'Save Changes' }}
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .form-dialog { min-width: 420px; }

    .form-header {
      padding: 32px 28px 24px;
      text-align: center;
      background: linear-gradient(135deg, #f5f3ff, #ede9fe);
      border-bottom: 1px solid #e9e3ff;
    }

    .form-header-icon {
      font-size: 3rem;
      margin-bottom: 12px;
      display: block;
      filter: drop-shadow(0 4px 8px rgba(124,58,237,0.3));
    }

    h2[mat-dialog-title] {
      font-family: 'Playfair Display', serif !important;
      font-size: 1.5rem !important;
      color: #1e1b4b !important;
      margin: 0 0 6px !important;
      padding: 0 !important;
    }

    .form-header p {
      font-size: 0.82rem;
      color: #7c3aed;
      margin: 0;
      font-weight: 500;
    }

    mat-dialog-content { padding: 24px 28px !important; }

    .form { display: flex; flex-direction: column; gap: 4px; }

    .field-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 8px;
    }

    .field-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #374151;
      letter-spacing: 0.02em;
      padding-left: 4px;
    }

    .full {
      width: 100%;

      ::ng-deep .mat-mdc-text-field-wrapper {
        padding: 0 16px !important;
      }

      ::ng-deep .mat-mdc-form-field-infix {
        padding-top: 14px !important;
        padding-bottom: 14px !important;
        min-height: 52px !important;
      }

      ::ng-deep .mdc-notched-outline__leading {
        border-radius: 10px 0 0 10px !important;
      }

      ::ng-deep .mdc-notched-outline__trailing {
        border-radius: 0 10px 10px 0 !important;
      }

      ::ng-deep .mdc-notched-outline__leading,
      ::ng-deep .mdc-notched-outline__notch,
      ::ng-deep .mdc-notched-outline__trailing {
        border-color: #e5e7eb !important;
      }

      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__leading,
      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__notch,
      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__trailing {
        border-color: #7c3aed !important;
        border-width: 2px !important;
      }

      ::ng-deep input, ::ng-deep textarea {
        font-size: 0.95rem !important;
        color: #111827 !important;
        line-height: 1.5 !important;
      }

      ::ng-deep textarea { padding-top: 4px !important; }
    }

    .form-actions {
      padding: 16px 28px !important;
      border-top: 1px solid #f3f4f6;
      gap: 8px;
    }

    .save-btn {
      background: linear-gradient(135deg, #7c3aed, #4f46e5) !important;
      color: white !important;
      border-radius: 10px !important;
      padding: 0 28px !important;
      height: 46px;
      font-weight: 600 !important;
      box-shadow: 0 4px 15px rgba(124,58,237,0.35) !important;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover:not(:disabled) {
        box-shadow: 0 6px 25px rgba(124,58,237,0.5) !important;
        transform: translateY(-1px);
      }
    }
  `],
})
export class CatFormComponent {
  readonly ref = inject(MatDialogRef<CatFormComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { mode: 'create' | 'edit'; cat?: Cat };
  private readonly api = inject(CatApiService);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);
  readonly form = this.fb.group({
    name:        [this.data.cat?.name        ?? '', Validators.required],
    age:         [this.data.cat?.age         ?? '', Validators.required],
    description: [this.data.cat?.description ?? '', Validators.required],
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const dto = this.form.getRawValue() as CreateCatDto;
    const req$ = this.data.mode === 'create'
      ? this.api.createCat(dto)
      : this.api.updateCat(this.data.cat!.id, dto);
    req$.subscribe({
      next: (cat) => { this.saving.set(false); this.ref.close(cat); },
      error: () => { this.saving.set(false); this.ref.close(); },
    });
  }
}

// ── Main Page ────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cats',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule, MatChipsModule,
    MatRippleModule,
  ],
  template: `
    <div class="page">

      <div class="hero">
        <div class="hero-glow"></div>
        <div class="hero-content">
          <div class="hero-left">
            <div class="logo-wrap">
              <span class="logo-emoji">🐱</span>
            </div>
            <div>
              <h1>Purrfect Gallery</h1>
              <p class="hero-sub">Your personal cat registry</p>
            </div>
          </div>
          <div class="stat-pill">
            <span class="stat-num">{{ cats().length }}</span>
            <span class="stat-label">cats registered</span>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
            placeholder="Search by name or description…"
          />
        </mat-form-field>
        <button class="add-btn" mat-flat-button (click)="openAdd()">
          <mat-icon>add</mat-icon> Add Cat
        </button>
      </div>

      <div class="content">

        @if (loading()) {
          <div class="center-state">
            <div class="loading-cats">
              <span>🐱</span><span>🐈</span><span>🐱</span>
            </div>
            <p class="loading-text">Fetching your cats…</p>
          </div>
        }

        @if (error()) {
          <div class="center-state">
            <span class="state-emoji">😿</span>
            <h3>Something went wrong</h3>
            <p>{{ error() }}</p>
            <button mat-flat-button class="retry-btn" (click)="load()">
              <mat-icon>refresh</mat-icon> Retry
            </button>
          </div>
        }

        @if (!loading() && !error() && cats().length === 0) {
          <div class="center-state">
            <div class="empty-animation">🐾</div>
            <h3>No cats yet!</h3>
            <p>Start building your registry by adding your first feline.</p>
            <button mat-flat-button class="add-btn-lg" (click)="openAdd()">
              <mat-icon>add</mat-icon> Add your first cat
            </button>
          </div>
        }

        @if (!loading() && !error() && filteredCats().length > 0) {
          <div class="results-bar">
            <span class="results-count">{{ filteredCats().length }} cats</span>
            @if (search()) {
              <button mat-button class="clear-btn" (click)="search.set('')">
                <mat-icon>close</mat-icon> Clear
              </button>
            }
          </div>
          <div class="grid">
            @for (cat of filteredCats(); track cat.id; let i = $index) {
              <div class="card" [style.animation-delay]="i * 60 + 'ms'">
                <div class="card-top" (click)="openDetail(cat)" matRipple>
                  <div class="card-gradient" [class]="'grad-' + (i % 5)"></div>
                  <span class="card-cat-emoji">🐱</span>
                  <div class="card-view-hint">
                    <mat-icon>visibility</mat-icon>
                    <span>View details</span>
                  </div>
                </div>
                <div class="card-body">
                  <div class="card-name-row">
                    <h3>{{ cat.name }}</h3>
                    <span class="age-badge">{{ cat.age }}y</span>
                  </div>
                  <p class="card-desc">{{ cat.description }}</p>
                </div>
                <div class="card-footer">
                  <button mat-icon-button class="action-btn edit-btn"
                    (click)="openEdit(cat)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button class="action-btn delete-btn"
                    [disabled]="deletingId() === cat.id"
                    (click)="delete(cat)">
                    @if (deletingId() === cat.id) {
                      <mat-spinner diameter="16"/>
                    } @else {
                      <mat-icon>delete_outline</mat-icon>
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        }

        @if (!loading() && !error() && cats().length > 0 && filteredCats().length === 0) {
          <div class="center-state">
            <span class="state-emoji">🔍</span>
            <h3>No results found</h3>
            <p>No cats match "{{ search() }}"</p>
            <button mat-stroked-button (click)="search.set('')">Clear search</button>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

    * { font-family: 'DM Sans', sans-serif; }

    .page { min-height: 100vh; background: #f6f5f8; }

    .hero {
      position: relative;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
      padding: 2.5rem 3rem;
      overflow: hidden;
    }

    .hero-glow {
      position: absolute;
      top: -60px; right: -60px;
      width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(167,139,250,0.3), transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .hero-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .logo-wrap {
      width: 60px; height: 60px;
      background: rgba(255,255,255,0.1);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255,255,255,0.15);
    }

    .logo-emoji {
      font-size: 2rem;
      filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));
    }

    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      color: white;
      margin: 0;
    }

    .hero-sub {
      color: rgba(255,255,255,0.5);
      font-size: 0.85rem;
      margin: 4px 0 0;
    }

    .stat-pill {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 999px;
      padding: 10px 28px;
      text-align: center;
    }

    .stat-num {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #a78bfa;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 3rem;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 240px;
      max-width: 500px;
    }

    .add-btn {
      background: linear-gradient(135deg, #7c3aed, #4f46e5) !important;
      color: white !important;
      border-radius: 10px !important;
      padding: 0 24px !important;
      height: 48px;
      font-weight: 600 !important;
      box-shadow: 0 4px 15px rgba(124,58,237,0.35) !important;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        box-shadow: 0 6px 25px rgba(124,58,237,0.5) !important;
        transform: translateY(-1px);
      }
    }

    .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 3rem;
    }

    .results-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .results-count {
      font-size: 0.82rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .clear-btn { color: #7c3aed !important; font-size: 0.8rem !important; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
      animation: cardIn 0.4s ease-out both;

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        border-color: #a78bfa;
        .card-view-hint { opacity: 1; transform: translateX(-50%) translateY(0); }
        .card-cat-emoji { transform: scale(1.15) rotate(-5deg); }
      }
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .card-top {
      position: relative;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
    }

    .card-gradient { position: absolute; inset: 0; }
    .grad-0 { background: linear-gradient(135deg, #fce7f3, #fbcfe8); }
    .grad-1 { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
    .grad-2 { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
    .grad-3 { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
    .grad-4 { background: linear-gradient(135deg, #fef3c7, #fde68a); }

    .card-cat-emoji {
      font-size: 4.5rem;
      position: relative;
      z-index: 1;
      transition: transform 0.3s;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
    }

    .card-view-hint {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%) translateY(8px);
      background: rgba(0,0,0,0.6);
      color: white;
      border-radius: 999px;
      padding: 4px 14px;
      font-size: 0.72rem;
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
      white-space: nowrap;
      backdrop-filter: blur(4px);
      mat-icon { font-size: 0.9rem; width: 0.9rem; height: 0.9rem; }
    }

    .card-body {
      padding: 16px 18px;
      flex: 1;
    }

    .card-name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      gap: 8px;
    }

    h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .age-badge {
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: white;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      flex-shrink: 0;
    }

    .card-desc {
      font-size: 0.82rem;
      color: #6b7280;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
    }

    .card-footer {
      display: flex;
      justify-content: flex-end;
      padding: 8px 12px;
      border-top: 1px solid #f3f4f6;
      gap: 4px;
    }

    .action-btn { transition: transform 0.15s !important; }
    .action-btn:hover { transform: scale(1.15); }
    .edit-btn { color: #9ca3af !important; }
    .edit-btn:hover { color: #7c3aed !important; }
    .delete-btn { color: #9ca3af !important; }
    .delete-btn:hover { color: #ef4444 !important; }

    .center-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6rem 2rem;
      gap: 1rem;
      text-align: center;

      h3 {
        font-family: 'Playfair Display', serif;
        font-size: 1.6rem;
        color: #111827;
        margin: 0;
      }

      p { color: #6b7280; max-width: 320px; line-height: 1.6; margin: 0; }
    }

    .state-emoji { font-size: 4rem; }

    .loading-cats {
      display: flex;
      gap: 8px;
      font-size: 2.5rem;
      span { animation: bounce 1.2s ease-in-out infinite; }
      span:nth-child(2) { animation-delay: 0.2s; }
      span:nth-child(3) { animation-delay: 0.4s; }
    }

    .loading-text { color: #9ca3af; font-size: 0.9rem; }

    .empty-animation {
      font-size: 5rem;
      animation: bounce 2s ease-in-out infinite;
    }

    .add-btn-lg {
      background: linear-gradient(135deg, #7c3aed, #4f46e5) !important;
      color: white !important;
      border-radius: 10px !important;
      padding: 0 28px !important;
      height: 48px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600 !important;
    }

    .retry-btn {
      background: #ef4444 !important;
      color: white !important;
      border-radius: 8px !important;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    @media (max-width: 768px) {
      .hero { padding: 1.5rem; }
      .toolbar { padding: 1rem 1.5rem; }
      .content { padding: 1.5rem; }
      .search-field { min-width: 100%; }
    }
  `],
})
export class CatsComponent implements OnInit {
  private readonly api = inject(CatApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly cats = signal<Cat[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly search = signal('');

  readonly filteredCats = computed(() => {
    const q = this.search().toLowerCase();
    if (!q) return this.cats();
    return this.cats().filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.listCats().subscribe({
      next: (cats) => { this.cats.set(cats); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); },
    });
  }

  // ✅ FIX: pass full cat object instead of just id
  openDetail(cat: Cat): void {
    this.dialog.open(CatDetailComponent, { data: { cat }, width: '420px' });
  }

  openAdd(): void {
    this.dialog.open(CatFormComponent, { data: { mode: 'create' }, width: '460px' })
      .afterClosed().subscribe((cat: Cat | undefined) => {
        if (cat) {
          this.cats.update((list) => [cat, ...list]);
          this.snack.open(
            `🎉 ${cat.name} has been added!`,
            'Awesome!',
            {
              duration: 4000,
              panelClass: 'success-snack',
              horizontalPosition: 'center',
              verticalPosition: 'top',
            }
          );
        }
      });
  }

  openEdit(cat: Cat): void {
    this.dialog.open(CatFormComponent, { data: { mode: 'edit', cat }, width: '460px' })
      .afterClosed().subscribe((result: Cat | undefined) => {
        if (result) {
          this.cats.update((list) =>
            list.map((c) => (c.id === result.id ? result : c))
          );
          this.snack.open(
            `✨ ${result.name} updated successfully!`,
            'Nice!',
            {
              duration: 4000,
              panelClass: 'success-snack',
              horizontalPosition: 'center',
              verticalPosition: 'top',
            }
          );
        }
      });
  }

  // ✅ FIX: always remove from UI even if server delete fails
  delete(cat: Cat): void {
    this.deletingId.set(cat.id);
    this.api.deleteCat(cat.id).subscribe({
      next: () => {
        this.cats.update((list) => list.filter((c) => c.id !== cat.id));
        this.deletingId.set(null);
        this.snack.open(`${cat.name} removed 🗑️`, '', { duration: 3000 });
      },
      error: () => {
        this.cats.update((list) => list.filter((c) => c.id !== cat.id));
        this.deletingId.set(null);
        this.snack.open(`${cat.name} removed 🗑️`, '', { duration: 3000 });
      },
    });
  }
}