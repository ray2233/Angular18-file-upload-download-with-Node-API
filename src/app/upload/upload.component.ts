import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent implements OnInit {
  selectedFile: File | null = null;
  files: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('http://localhost:8080/api/files/upload', formData).subscribe({
      next: () => {
        alert('Upload successful');
        this.loadFiles();
      },
      error: () => alert('Upload failed')
    });
  }

  downloadFile(fileName: string) {
    this.http.get(`http://localhost:8080/api/files/download/${fileName}`, {
      responseType: 'blob'
    }).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  deleteFile(fileName: string) {
  if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;

  this.http.delete(`http://localhost:8080/api/files/${encodeURIComponent(fileName)}`)
    .subscribe({
      next: () => {
        alert('File deleted successfully');
        this.loadFiles();
      },
      error: (err) => {
        console.error('Delete error:', err);
        alert('Failed to delete file');
      }
    });
}

  loadFiles() {
    this.http.get<string[]>('http://localhost:8080/api/files')
      .subscribe(data => this.files = data);
  }

  getImageUrl(fileName: string): string {
    return `http://localhost:8080/uploads/${fileName}`;
  }
  isImage(fileName: string): boolean {
    return /\.(jpe?g|png|gif|bmp|webp)$/i.test(fileName);
  }
}
