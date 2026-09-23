import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'mediaUrl',
  standalone: true,
})
export class MediaUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    // environment.apiUrl vaut "http://localhost:8080/api" -> on retire "/api"
    const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}