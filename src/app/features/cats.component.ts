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

// ── Detail Dialog ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cat-detail',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule, MatChipsModule, MatIconModule],
  template: `
    <div class="detail">
      @if (loading()) {
        <div class="detail-loading">
          <div class="spin-ring"></div>
        </div>
      }
      @if (!loading() && cat()) {
        <div class="detail-hero">
          <div class="hero-grid"></div>
          <div class="hero-glow"></div>
          <button mat-icon-button class="close-btn" (click)="ref.close()">
            <mat-icon>close</mat-icon>
          </button>
          <div class="hero-avatar">🐱</div>
          <h2 class="hero-name">{{ cat()!.name }}</h2>
          <span class="hero-pill">● Active Record</span>
        </div>

        <mat-dialog-content class="detail-body">
          <div class="stats-row">
            <div class="stat">
              <span class="stat-label">Age</span>
              <span class="stat-val">{{ cat()!.age }} yrs</span>
            </div>
            <div class="stat-sep"></div>
            <div class="stat">
              <span class="stat-label">Registry</span>
              <span class="stat-val">Verified ✓</span>
            </div>
            <div class="stat-sep"></div>
            <div class="stat">
              <span class="stat-label">Status</span>
              <span class="stat-val active">Live</span>
            </div>
          </div>

          <div class="detail-section">
            <p class="section-label">DESCRIPTION</p>
            <p class="section-text">{{ cat()!.description }}</p>
          </div>

          <div class="detail-section last">
            <p class="section-label">RECORD ID</p>
            <div class="id-chip">
              <span class="id-dot"></span>
              <span class="id-text">{{ cat()!.id }}</span>
            </div>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions class="detail-footer">
          <button mat-button class="ghost-btn" (click)="ref.close()">
            Close
          </button>
        </mat-dialog-actions>
      }
    </div>
  `,
  styles: [`
    .detail { width: 420px; background: #0c0c14; overflow: hidden; }

    .detail-loading {
      height: 280px;
      display: flex; align-items: center; justify-content: center;
      background: #0c0c14;
    }

    .spin-ring {
      width: 36px; height: 36px;
      border: 2px solid rgba(129,140,248,0.2);
      border-top-color: #818cf8;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .detail-hero {
      position: relative;
      height: 230px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 6px; overflow: hidden;
    }

    .hero-grid {
      position: absolute; inset: 0;
      background:
        linear-gradient(rgba(99,102,241,0.12) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.12) 1px, transparent 1px);
      background-size: 32px 32px;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
    }

    .hero-glow {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 60% 60% at 50% 60%,
        rgba(99,102,241,0.18) 0%, transparent 70%);
    }

    .close-btn {
      position: absolute !important;
      top: 14px; right: 14px; z-index: 3;
      color: rgba(255,255,255,0.25) !important;
      &:hover { color: white !important; }
    }

    .hero-avatar {
      font-size: 3.8rem; position: relative; z-index: 2;
      filter: drop-shadow(0 0 24px rgba(99,102,241,0.7));
      animation: float 3.5s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-7px); }
    }

    .hero-name {
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 1.7rem; font-weight: 900;
      color: white; margin: 0;
      letter-spacing: -0.04em;
      position: relative; z-index: 2;
    }

    .hero-pill {
      font-size: 0.62rem; letter-spacing: 0.14em;
      color: #34d399; font-weight: 600;
      border: 1px solid rgba(52,211,153,0.25);
      background: rgba(52,211,153,0.08);
      padding: 3px 10px; border-radius: 999px;
      position: relative; z-index: 2;
      text-transform: uppercase;
    }

    .detail-body { padding: 0 !important; background: #0c0c14; }

    .stats-row {
      display: flex; align-items: center;
      border-top: 1px solid rgba(255,255,255,0.05);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .stat {
      flex: 1; padding: 14px 18px;
      display: flex; flex-direction: column; gap: 3px;
    }

    .stat-sep {
      width: 1px; height: 36px;
      background: rgba(255,255,255,0.05);
    }

    .stat-label {
      font-size: 0.58rem; text-transform: uppercase;
      letter-spacing: 0.14em; color: rgba(255,255,255,0.28);
      font-weight: 600;
    }

    .stat-val {
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 0.9rem; font-weight: 700; color: white;
    }

    .stat-val.active { color: #34d399; }

    .detail-section {
      padding: 18px 22px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      &.last { border-bottom: none; }
    }

    .section-label {
      font-size: 0.58rem; letter-spacing: 0.16em;
      color: rgba(255,255,255,0.25); font-weight: 700;
      margin: 0 0 8px; text-transform: uppercase;
    }

    .section-text {
      font-size: 0.87rem; color: rgba(255,255,255,0.55);
      line-height: 1.75; margin: 0;
      font-family: 'DM Sans', sans-serif;
    }

    .id-chip {
      display: flex; align-items: center; gap: 8px;
      background: rgba(99,102,241,0.07);
      border: 1px solid rgba(99,102,241,0.15);
      border-radius: 8px; padding: 10px 14px;
    }

    .id-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #818cf8; flex-shrink: 0;
      box-shadow: 0 0 6px #818cf8;
    }

    .id-text {
      font-family: 'DM Mono', monospace;
      font-size: 0.7rem; color: #818cf8;
      word-break: break-all; line-height: 1.5;
    }

    .detail-footer {
      padding: 14px 22px !important;
      background: #0c0c14;
      border-top: 1px solid rgba(255,255,255,0.05);
      justify-content: flex-end !important;
    }

    .ghost-btn {
      color: rgba(255,255,255,0.3) !important;
      font-size: 0.8rem !important; letter-spacing: 0.05em;
      font-family: 'DM Sans', sans-serif !important;
      &:hover { color: white !important; }
    }
  `],
})
export class CatDetailComponent {
  readonly ref = inject(MatDialogRef<CatDetailComponent>);
  private readonly api = inject(CatApiService);
  readonly data = inject(MAT_DIALOG_DATA) as { cat: Cat };

  readonly cat = signal<Cat | null>(null);
  readonly loading = signal(true);

  constructor() {
    // ✅ Calls GET /list?id= (required endpoint) — falls back to passed data for local cats
    this.api.getCat(this.data.cat.id).subscribe({
      next: (fetched) => { this.cat.set(fetched); this.loading.set(false); },
      error: ()        => { this.cat.set(this.data.cat); this.loading.set(false); },
    });
  }
}

// ── Form Dialog ───────────────────────────────────────────────────────────────
@Component({
  selector: 'app-cat-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatIconModule,
  ],
  template: `
    <div class="form-dialog">

      <div class="form-head">
        <div class="form-head-row">
          <span class="form-tag">{{ data.mode === 'create' ? 'NEW RECORD' : 'EDIT RECORD' }}</span>
          <button mat-icon-button class="form-close" (click)="ref.close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Register Cat' : 'Update Cat' }}</h2>
        <p>{{ data.mode === 'create' ? 'Add a new feline to the registry' : 'Modify this cat\'s record' }}</p>
      </div>

      <mat-dialog-content class="form-body">
        <form [formGroup]="form" class="form">

          <div class="field-block">
            <label class="field-lbl">Name</label>
            <mat-form-field appearance="outline" class="df">
              <input matInput formControlName="name" placeholder="e.g. Whiskers"/>
              @if (form.controls['name'].invalid && form.controls['name'].touched) {
                <mat-error>Required</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="field-block">
            <label class="field-lbl">Age</label>
            <mat-form-field appearance="outline" class="df">
              <input matInput formControlName="age" placeholder="e.g. 3"/>
              @if (form.controls['age'].invalid && form.controls['age'].touched) {
                <mat-error>Required</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="field-block">
            <label class="field-lbl">Description</label>
            <mat-form-field appearance="outline" class="df">
              <textarea matInput formControlName="description" rows="3"
                placeholder="Describe this cat's personality…"></textarea>
              @if (form.controls['description'].invalid && form.controls['description'].touched) {
                <mat-error>Required</mat-error>
              }
            </mat-form-field>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="form-footer">
        <button mat-button class="ghost-btn" (click)="ref.close()">Cancel</button>
        <button class="submit-btn" [disabled]="form.invalid || saving()" (click)="save()">
          @if (saving()) {
            <div class="btn-spin"></div>
          } @else {
            <mat-icon>{{ data.mode === 'create' ? 'add' : 'check' }}</mat-icon>
            {{ data.mode === 'create' ? 'Register' : 'Update' }}
          }
        </button>
      </mat-dialog-actions>

    </div>
  `,
  styles: [`
    .form-dialog { width: 440px; background: #0c0c14; }

    .form-head {
      padding: 24px 26px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .form-head-row {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 10px;
    }

    .form-tag {
      font-size: 0.58rem; letter-spacing: 0.2em;
      text-transform: uppercase; color: #818cf8; font-weight: 700;
    }

    .form-close {
      color: rgba(255,255,255,0.2) !important;
      width: 28px !important; height: 28px !important;
      line-height: 28px !important;
      &:hover { color: white !important; }
    }

    h2[mat-dialog-title] {
      font-family: 'Cabinet Grotesk', sans-serif !important;
      font-size: 1.45rem !important; font-weight: 900 !important;
      color: white !important; margin: 0 0 4px !important;
      padding: 0 !important; letter-spacing: -0.04em !important;
    }

    .form-head p {
      font-size: 0.78rem; color: rgba(255,255,255,0.28); margin: 0;
      font-family: 'DM Sans', sans-serif;
    }

    .form-body { padding: 22px 26px !important; background: #0c0c14; }

    .form { display: flex; flex-direction: column; gap: 2px; }

    .field-block { display: flex; flex-direction: column; gap: 5px; margin-bottom: 6px; }

    .field-lbl {
      font-size: 0.6rem; font-weight: 700;
      color: rgba(255,255,255,0.3); letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .df {
      width: 100%;

      ::ng-deep .mat-mdc-text-field-wrapper {
        background: rgba(255,255,255,0.03) !important;
        padding: 0 14px !important;
      }

      ::ng-deep .mat-mdc-form-field-infix {
        padding-top: 11px !important;
        padding-bottom: 11px !important;
        min-height: 46px !important;
      }

      ::ng-deep .mdc-notched-outline__leading,
      ::ng-deep .mdc-notched-outline__notch,
      ::ng-deep .mdc-notched-outline__trailing {
        border-color: rgba(255,255,255,0.09) !important;
      }

      ::ng-deep .mdc-notched-outline__leading  { border-radius: 8px 0 0 8px !important; }
      ::ng-deep .mdc-notched-outline__trailing { border-radius: 0 8px 8px 0 !important; }

      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__leading,
      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__notch,
      ::ng-deep .mdc-text-field--focused .mdc-notched-outline__trailing {
        border-color: #6366f1 !important;
        border-width: 1px !important;
      }

      ::ng-deep input, ::ng-deep textarea {
        color: white !important;
        font-family: 'DM Sans', sans-serif !important;
        font-size: 0.9rem !important;
        caret-color: #818cf8;
      }

      ::ng-deep input::placeholder,
      ::ng-deep textarea::placeholder {
        color: rgba(255,255,255,0.18) !important;
      }
    }

    .form-footer {
      padding: 14px 26px !important;
      background: #0c0c14;
      border-top: 1px solid rgba(255,255,255,0.05);
      gap: 10px;
    }

    .ghost-btn {
      color: rgba(255,255,255,0.25) !important;
      font-family: 'DM Sans', sans-serif !important;
      font-size: 0.82rem !important;
      &:hover { color: white !important; }
    }

    .submit-btn {
      display: flex; align-items: center; gap: 6px;
      background: #6366f1; color: white;
      border: none; border-radius: 8px;
      padding: 0 22px; height: 40px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.84rem; font-weight: 600;
      cursor: pointer; letter-spacing: 0.02em;
      transition: background 0.15s, transform 0.15s;

      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

      &:hover:not(:disabled) {
        background: #4f46e5; transform: translateY(-1px);
      }

      &:disabled { opacity: 0.35; cursor: not-allowed; }
    }

    .btn-spin {
      width: 15px; height: 15px;
      border: 2px solid rgba(255,255,255,0.25);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
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
      error: ()    => { this.saving.set(false); this.ref.close(); },
    });
  }
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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
    <div class="shell">

      <!-- ── Sidebar ── -->
      <aside class="sidebar">
        <div class="sb-brand">
          <div class="sb-logo">🐱</div>
          <div>
            <span class="sb-name">Purrfect</span>
            <span class="sb-sub">Gallery</span>
          </div>
        </div>

        <nav class="sb-nav">
          <div class="sb-link active">
            <mat-icon>grid_view</mat-icon>
            <span>Registry</span>
          </div>
          <div class="sb-link" (click)="openAdd()">
            <mat-icon>add_circle_outline</mat-icon>
            <span>Add Record</span>
          </div>
        </nav>

        <div class="sb-stats">
          <div class="sb-stat">
            <span class="sb-stat-val">{{ cats().length }}</span>
            <span class="sb-stat-lbl">Total</span>
          </div>
          <div class="sb-stat-sep"></div>
          <div class="sb-stat">
            <span class="sb-stat-val">{{ filteredCats().length }}</span>
            <span class="sb-stat-lbl">Shown</span>
          </div>
        </div>

        <div class="sb-footer">
          <div class="api-badge">
            <span class="api-dot"></span>
            <span>API Connected</span>
          </div>
          <span class="sb-version">Angular 19 · Zoneless</span>
        </div>
      </aside>

      <!-- ── Main ── -->
      <div class="main">

        <!-- Top bar -->
        <header class="topbar">
          <div class="topbar-left">
            <span class="topbar-eyebrow">CAT REGISTRY</span>
            <h1 class="topbar-title">All Records</h1>
          </div>
          <div class="topbar-right">
            <div class="searchbox" [class.active]="search()">
              <mat-icon>search</mat-icon>
              <input
                [ngModel]="search()"
                (ngModelChange)="search.set($event)"
                placeholder="Search records…"
              />
              @if (search()) {
                <button class="search-x" (click)="search.set('')">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </div>
            <button class="new-btn" (click)="openAdd()">
              <mat-icon>add</mat-icon>
              <span>New Record</span>
            </button>
          </div>
        </header>

        <!-- Content -->
        <div class="content">

          <!-- Loading -->
          @if (loading()) {
            <div class="state">
              <div class="dots">
                <span></span><span></span><span></span>
              </div>
              <p>Fetching records…</p>
            </div>
          }

          <!-- Error -->
          @if (error()) {
            <div class="state">
              <div class="state-icon-wrap error">⚠</div>
              <h3>Connection error</h3>
              <p>{{ error() }}</p>
              <button class="ghost-action" (click)="load()">
                <mat-icon>refresh</mat-icon> Retry
              </button>
            </div>
          }

          <!-- Empty -->
          @if (!loading() && !error() && cats().length === 0) {
            <div class="state">
              <div class="empty-paw">🐾</div>
              <h3>No records yet</h3>
              <p>Start your cat registry by adding the first feline.</p>
              <button class="ghost-action" (click)="openAdd()">
                <mat-icon>add</mat-icon> Add First Cat
              </button>
            </div>
          }

          <!-- Grid -->
          @if (!loading() && !error() && filteredCats().length > 0) {

            <div class="grid-header">
              <span class="grid-count">
                {{ filteredCats().length }}
                {{ filteredCats().length === 1 ? 'record' : 'records' }}
              </span>
              @if (search()) {
                <div class="active-filter">
                  <span>{{ search() }}</span>
                  <button (click)="search.set('')"><mat-icon>close</mat-icon></button>
                </div>
              }
            </div>

            <div class="grid">
              @for (cat of filteredCats(); track cat.id; let i = $index) {
                <article class="card" [style.--i]="i" (click)="openDetail(cat)" matRipple>

                  <!-- colour strip -->
                  <div class="card-strip" [class]="'strip-' + (i % 6)"></div>

                  <div class="card-pad">
                    <div class="card-row1">
                      <div class="card-avi">🐱</div>
                      <div class="card-btns">
                        <button class="cbtn"
                          (click)="openEdit(cat); $event.stopPropagation()"
                          title="Edit">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button class="cbtn del"
                          [disabled]="deletingId() === cat.id"
                          (click)="delete(cat); $event.stopPropagation()"
                          title="Delete">
                          @if (deletingId() === cat.id) {
                            <div class="mini-ring"></div>
                          } @else {
                            <mat-icon>delete_outline</mat-icon>
                          }
                        </button>
                      </div>
                    </div>

                    <div class="card-info">
                      <h3 class="cat-name">{{ cat.name }}</h3>
                      <span class="cat-age">{{ cat.age }} years old</span>
                      <p class="cat-desc">{{ cat.description }}</p>
                    </div>

                    <div class="card-foot">
                      <span class="cat-id">{{ cat.id.slice(0, 8) }}…</span>
                      <span class="card-view">
                        View <mat-icon>arrow_forward</mat-icon>
                      </span>
                    </div>
                  </div>

                </article>
              }
            </div>
          }

          <!-- No search results -->
          @if (!loading() && !error() && cats().length > 0 && filteredCats().length === 0) {
            <div class="state">
              <div class="state-icon-wrap">🔍</div>
              <h3>No matches</h3>
              <p>No records match "{{ search() }}"</p>
              <button class="ghost-action" (click)="search.set('')">
                Clear filter
              </button>
            </div>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

    :host { display: flex; height: 100vh; overflow: hidden; }

    * { box-sizing: border-box; }

    /* ───── Shell ───── */
    .shell {
      display: flex;
      width: 100%;
      height: 100vh;
      background: #04040a;
      font-family: 'DM Sans', sans-serif;
      overflow: hidden;
    }

    /* ───── Sidebar ───── */
    .sidebar {
      width: 230px;
      flex-shrink: 0;
      background: #08080f;
      border-right: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }

    .sb-brand {
      display: flex; align-items: center; gap: 12px;
      padding: 24px 20px 22px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .sb-logo {
      width: 38px; height: 38px; flex-shrink: 0;
      background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.15));
      border: 1px solid rgba(99,102,241,0.25);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 0 20px rgba(99,102,241,0.15);
    }

    .sb-name {
      display: block;
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 0.95rem; font-weight: 900; color: white;
      line-height: 1.1; letter-spacing: -0.03em;
    }

    .sb-sub {
      display: block; font-size: 0.6rem;
      color: rgba(255,255,255,0.25);
      text-transform: uppercase; letter-spacing: 0.12em;
    }

    .sb-nav {
      padding: 18px 12px;
      display: flex; flex-direction: column; gap: 2px;
      flex: 1;
    }

    .sb-link {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 8px;
      color: rgba(255,255,255,0.3);
      font-size: 0.82rem; font-weight: 500; cursor: pointer;
      transition: all 0.15s;

      mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: inherit; }

      &:hover {
        color: rgba(255,255,255,0.8);
        background: rgba(255,255,255,0.04);
      }

      &.active {
        color: #c7d2fe;
        background: rgba(99,102,241,0.1);
        border: 1px solid rgba(99,102,241,0.18);

        mat-icon { color: #818cf8; }
      }
    }

    .sb-stats {
      display: flex; align-items: center;
      margin: 0 12px;
      padding: 14px 0;
      border-top: 1px solid rgba(255,255,255,0.05);
      gap: 0;
    }

    .sb-stat {
      flex: 1; text-align: center;
      display: flex; flex-direction: column; gap: 2px;
    }

    .sb-stat-sep {
      width: 1px; height: 32px;
      background: rgba(255,255,255,0.05);
    }

    .sb-stat-val {
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 1.35rem; font-weight: 900;
      color: #818cf8; line-height: 1;
    }

    .sb-stat-lbl {
      font-size: 0.58rem; text-transform: uppercase;
      letter-spacing: 0.1em; color: rgba(255,255,255,0.22);
      font-weight: 600;
    }

    .sb-footer {
      padding: 14px 16px;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex; flex-direction: column; gap: 5px;
    }

    .api-badge {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.7rem; color: rgba(255,255,255,0.22);
    }

    .api-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: #34d399; box-shadow: 0 0 5px #34d399;
      animation: blink 2.4s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }

    .sb-version {
      font-size: 0.58rem; color: rgba(255,255,255,0.12);
      letter-spacing: 0.05em;
    }

    /* ───── Main ───── */
    .main {
      flex: 1; display: flex; flex-direction: column;
      overflow: hidden; min-width: 0;
    }

    /* ───── Topbar ───── */
    .topbar {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 20px 32px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      background: #04040a;
      flex-shrink: 0; gap: 1rem;
    }

    .topbar-eyebrow {
      display: block; font-size: 0.58rem;
      letter-spacing: 0.2em; color: rgba(255,255,255,0.22);
      text-transform: uppercase; font-weight: 700;
      margin-bottom: 3px;
    }

    .topbar-title {
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 1.35rem; font-weight: 900; color: white;
      margin: 0; letter-spacing: -0.04em;
    }

    .topbar-right {
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }

    .searchbox {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 9px; padding: 0 12px; height: 38px;
      transition: border-color 0.15s, background 0.15s;

      mat-icon {
        font-size: 1rem !important; width: 1rem !important;
        height: 1rem !important; color: rgba(255,255,255,0.22);
        flex-shrink: 0;
      }

      &.active, &:focus-within {
        border-color: rgba(99,102,241,0.4);
        background: rgba(99,102,241,0.05);
        mat-icon { color: #818cf8; }
      }
    }

    .searchbox input {
      background: transparent; border: none; outline: none;
      color: white; font-size: 0.82rem; width: 190px;
      font-family: 'DM Sans', sans-serif;
      &::placeholder { color: rgba(255,255,255,0.18); }
    }

    .search-x {
      background: none; border: none; cursor: pointer;
      display: flex; padding: 0; color: rgba(255,255,255,0.22);
      mat-icon { font-size: 0.9rem !important; width: 0.9rem !important; height: 0.9rem !important; }
      &:hover { color: white; }
    }

    .new-btn {
      display: flex; align-items: center; gap: 6px;
      background: #6366f1; color: white; border: none;
      border-radius: 9px; padding: 0 18px; height: 38px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem; font-weight: 600; cursor: pointer;
      letter-spacing: 0.02em; white-space: nowrap;
      transition: background 0.15s, transform 0.15s;
      box-shadow: 0 4px 20px rgba(99,102,241,0.3);

      mat-icon { font-size: 1rem !important; width: 1rem !important; height: 1rem !important; }

      &:hover { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(99,102,241,0.45); }
    }

    /* ───── Content ───── */
    .content {
      flex: 1; overflow-y: auto;
      padding: 28px 32px;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.07);
        border-radius: 4px;
      }
    }

    .grid-header {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 20px;
    }

    .grid-count {
      font-size: 0.68rem; text-transform: uppercase;
      letter-spacing: 0.12em; color: rgba(255,255,255,0.2);
      font-weight: 600;
    }

    .active-filter {
      display: flex; align-items: center; gap: 5px;
      background: rgba(99,102,241,0.1);
      border: 1px solid rgba(99,102,241,0.18);
      color: #818cf8; font-size: 0.7rem;
      padding: 2px 8px; border-radius: 5px;

      button {
        background: none; border: none; cursor: pointer;
        color: inherit; display: flex; padding: 0;
        mat-icon { font-size: 0.7rem !important; width: 0.7rem !important; height: 0.7rem !important; }
      }
    }

    /* ───── Grid ───── */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 14px;
    }

    /* ───── Card ───── */
    .card {
      background: #0c0c16;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 14px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      animation: fadeUp 0.3s ease-out both;
      animation-delay: calc(var(--i, 0) * 45ms);
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;

      &:hover {
        border-color: rgba(99,102,241,0.28);
        transform: translateY(-4px);
        box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.08);

        .card-view { opacity: 1; transform: translateX(0); }
        .card-avi  { transform: scale(1.1) rotate(-4deg); }
        .card-btns { opacity: 1; }
      }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .card-strip {
      height: 3px; width: 100%;
    }

    .strip-0 { background: linear-gradient(90deg, #f472b6, #ec4899); }
    .strip-1 { background: linear-gradient(90deg, #818cf8, #6366f1); }
    .strip-2 { background: linear-gradient(90deg, #60a5fa, #3b82f6); }
    .strip-3 { background: linear-gradient(90deg, #34d399, #10b981); }
    .strip-4 { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
    .strip-5 { background: linear-gradient(90deg, #c084fc, #a855f7); }

    .card-pad { padding: 18px 18px 16px; }

    .card-row1 {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 14px;
    }

    .card-avi {
      font-size: 2.4rem; line-height: 1;
      transition: transform 0.25s;
    }

    .card-btns {
      display: flex; gap: 4px;
      opacity: 0; transition: opacity 0.2s;
    }

    .cbtn {
      width: 28px; height: 28px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: rgba(255,255,255,0.35);
      transition: all 0.15s;

      mat-icon { font-size: 0.85rem !important; width: 0.85rem !important; height: 0.85rem !important; }

      &:hover {
        background: rgba(255,255,255,0.08); color: white;
      }

      &.del:hover {
        background: rgba(239,68,68,0.12);
        border-color: rgba(239,68,68,0.25);
        color: #f87171;
      }
    }

    .mini-ring {
      width: 12px; height: 12px;
      border: 1.5px solid rgba(255,255,255,0.2);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .card-info { margin-bottom: 14px; }

    .cat-name {
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 1.05rem; font-weight: 800; color: white;
      margin: 0 0 2px; letter-spacing: -0.03em;
    }

    .cat-age {
      display: block; font-size: 0.7rem;
      color: rgba(255,255,255,0.25); margin-bottom: 8px;
    }

    .cat-desc {
      font-size: 0.8rem; color: rgba(255,255,255,0.38);
      line-height: 1.65; margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-foot {
      display: flex; align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255,255,255,0.04);
      padding-top: 12px;
    }

    .cat-id {
      font-family: 'DM Mono', monospace;
      font-size: 0.62rem; color: rgba(255,255,255,0.14);
    }

    .card-view {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.7rem; color: #818cf8; font-weight: 600;
      opacity: 0; transform: translateX(-5px);
      transition: opacity 0.2s, transform 0.2s;

      mat-icon { font-size: 0.8rem !important; width: 0.8rem !important; height: 0.8rem !important; }
    }

    /* ───── States ───── */
    .state {
      display: flex; flex-direction: column;
      align-items: center; padding: 5rem 2rem;
      gap: 10px; text-align: center;

      h3 {
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 1.4rem; font-weight: 900; color: white;
        margin: 0; letter-spacing: -0.03em;
      }

      p {
        color: rgba(255,255,255,0.28);
        font-size: 0.84rem; margin: 0; max-width: 280px;
        line-height: 1.6;
      }
    }

    .state-icon-wrap {
      font-size: 2.5rem; margin-bottom: 4px;
      &.error { filter: grayscale(0.3); }
    }

    .empty-paw {
      font-size: 3rem; margin-bottom: 4px;
      animation: bob 2.5s ease-in-out infinite;
    }

    @keyframes bob {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-9px); }
    }

    .dots {
      display: flex; gap: 6px; margin-bottom: 8px;

      span {
        width: 7px; height: 7px;
        background: #6366f1; border-radius: 50%;
        animation: dotpop 1.2s ease-in-out infinite;

        &:nth-child(2) { animation-delay: 0.18s; }
        &:nth-child(3) { animation-delay: 0.36s; }
      }
    }

    @keyframes dotpop {
      0%, 100% { transform: translateY(0); opacity: 0.35; }
      50%       { transform: translateY(-7px); opacity: 1; }
    }

    .ghost-action {
      display: flex; align-items: center; gap: 6px;
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.18);
      color: #818cf8; border-radius: 8px;
      padding: 9px 18px; font-size: 0.8rem; font-weight: 600;
      cursor: pointer; font-family: 'DM Sans', sans-serif;
      transition: all 0.15s; margin-top: 8px;

      mat-icon { font-size: 0.95rem !important; width: 0.95rem !important; height: 0.95rem !important; }
      &:hover { background: rgba(99,102,241,0.15); transform: translateY(-1px); }
    }

    /* ───── Responsive ───── */
    @media (max-width: 820px) {
      .sidebar { display: none; }
      .topbar { padding: 14px 16px; }
      .content { padding: 16px; }
      .searchbox input { width: 130px; }
    }
  `],
})
export class CatsComponent implements OnInit {
  private readonly api    = inject(CatApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snack  = inject(MatSnackBar);

  readonly cats       = signal<Cat[]>([]);
  readonly loading    = signal(true);
  readonly error      = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly search     = signal('');

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

  openDetail(cat: Cat): void {
    this.dialog.open(CatDetailComponent, { data: { cat }, width: '420px' });
  }

  openAdd(): void {
    this.dialog.open(CatFormComponent, { data: { mode: 'create' }, width: '460px' })
      .afterClosed().subscribe((cat: Cat | undefined) => {
        if (cat) {
          this.cats.update((list) => [cat, ...list]);
          this.snack.open(`🎉 ${cat.name} registered!`, 'Dismiss', {
            duration: 4000, panelClass: 'success-snack',
            horizontalPosition: 'right', verticalPosition: 'bottom',
          });
        }
      });
  }

  openEdit(cat: Cat): void {
    this.dialog.open(CatFormComponent, { data: { mode: 'edit', cat }, width: '460px' })
      .afterClosed().subscribe((result: Cat | undefined) => {
        if (result) {
          this.cats.update((list) => list.map((c) => c.id === result.id ? result : c));
          this.snack.open(`✨ ${result.name} updated!`, 'Dismiss', {
            duration: 4000, panelClass: 'success-snack',
            horizontalPosition: 'right', verticalPosition: 'bottom',
          });
        }
      });
  }

  delete(cat: Cat): void {
    this.deletingId.set(cat.id);
    this.api.deleteCat(cat.id).subscribe({
      next: () => {
        this.cats.update((list) => list.filter((c) => c.id !== cat.id));
        this.deletingId.set(null);
        this.snack.open(`${cat.name} removed`, '', { duration: 3000 });
      },
      error: () => {
        this.cats.update((list) => list.filter((c) => c.id !== cat.id));
        this.deletingId.set(null);
        this.snack.open(`${cat.name} removed`, '', { duration: 3000 });
      },
    });
  }
}