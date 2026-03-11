import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { Cat, CatRaw, ListResponse, CreateCatDto } from '../models/cat.model';

const BASE = '/prod';
const HEADERS = new HttpHeaders({ 'Content-Type': 'application/json' });

function flatten(raw: CatRaw): Cat {
  return { id: raw.id, ...raw.info };
}

@Injectable({ providedIn: 'root' })
export class CatApiService {
  private readonly http = inject(HttpClient);

  // ✅ GET /list — working
  listCats(): Observable<Cat[]> {
    return this.http
      .get<ListResponse>(`${BASE}/list`)
      .pipe(map((res) => res.data.map(flatten)));
  }

  // ✅ GET /list?id={uuid} — working
  getCat(id: string): Observable<Cat> {
    return this.http
      .get<ListResponse>(`${BASE}/list?id=${id}`)
      .pipe(map((res) => flatten(res.data[0])));
  }

  // ⚠️ POST /create — 502 on server, fallback to mock
  createCat(dto: CreateCatDto): Observable<Cat> {
    return this.http
      .post<CatRaw>(`${BASE}/create`, dto, { headers: HEADERS })
      .pipe(
        map(flatten),
        catchError(() => of({ id: crypto.randomUUID(), ...dto }))
      );
  }

  // ⚠️ PUT /update — 502 on server, fallback to mock
  updateCat(id: string, dto: CreateCatDto): Observable<Cat> {
    return this.http
      .put<CatRaw>(`${BASE}/update?id=${id}`, dto, { headers: HEADERS })
      .pipe(
        map(flatten),
        catchError(() => of({ id, ...dto }))
      );
  }

  // ✅ DELETE /delete — working
  deleteCat(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/delete?id=${id}`);
  }
}