export type Dimension='CHEST'|'WAIST'|'HIP';export type Unit='CM'|'IN';export type Fit='FITTED'|'REGULAR'|'LOOSE';
export type Profile={id?:string;label:string;category:string;fitPreference:Fit;preferredUnit:Unit;measurements:Partial<Record<Dimension,number>>};
export type Size={id?:string;label:string;measurements:Partial<Record<Dimension,number>>};
export type Chart={id?:string;sellerName:string;garmentName:string;garmentCategory:string;measurementConvention:'CIRCUMFERENCE';unit:Unit;sizes:Size[]};
export type Evidence={dimension:Dimension;bodyValue:number;bodyUnit:Unit;garmentValue:number;garmentUnit:Unit;bodyCm:number;garmentCm:number;differenceCm:number};
export type Comparison={id:string;profile:Profile;chart:Chart;sizes:{sizeLabel:string;evidence:Evidence[]}[];notice:string};
/** Default to the same-origin Vite /api proxy; optional override must include /api/v1. */
const base=(import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
export class ApiError extends Error { constructor(message:string, public readonly status?:number){super(message);this.name='ApiError'} }


let csrfToken: string | null = null;
export async function csrf(): Promise<string> {
  if (csrfToken) return csrfToken;
  const response = await fetch(base + '/auth/csrf', { credentials: 'same-origin' });
  if (!response.ok) throw new ApiError('Could not initialize secure session.', response.status);
  const data = await response.json() as {token: string};
  csrfToken = data.token;
  return csrfToken;
}
export function resetCsrf() { csrfToken = null; }
export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  const external = options.signal;
  const cancel = () => controller.abort();

  external?.addEventListener('abort', cancel, { once: true });

  try {
    const method = (options.method || 'GET').toUpperCase();
    const token = ['GET','HEAD','OPTIONS'].includes(method) ? null : await csrf();
    const res = await fetch(base + path, {
      ...options,
      signal: controller.signal,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-XSRF-TOKEN': token } : {}),
        ...options.headers,
      },
    });

    const raw = await res.text();

    let data: any = null;

    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }

    if (!res.ok) {
      console.error('[SizeSure API Error]', {
        status: res.status,
        path,
        response: data,
      });

      const message =
        typeof data === 'object' && data !== null && 'message' in data
          ? String(data.message)
          : `Request failed (${res.status}). Check the browser console for details.`;

      throw new ApiError(message, res.status);
    }

    if (typeof data === 'string') {
      throw new ApiError('Server returned an unexpected response.');
    }

    return data as T;

  } catch (e) {
    if (e instanceof ApiError) throw e;

    if (controller.signal.aborted) {
      throw new ApiError(
        'The request timed out or was cancelled. Please try again.'
      );
    }

    throw new ApiError(
      'Cannot reach the SizeSure backend. Check that Spring Boot is running on port 8080 and the database is available.'
    );

  } finally {
    clearTimeout(timer);
    external?.removeEventListener('abort', cancel);
  }
}


export const json=(method:string,body:unknown):RequestInit=>({method,body:JSON.stringify(body)});
