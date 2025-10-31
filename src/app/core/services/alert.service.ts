import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

/**
 * Configuration options for alerts
 */
export interface AlertConfig {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  timer?: number;
  showConfirmButton?: boolean;
}

/**
 * Service to handle all application alerts using SweetAlert2
 *
 * Provides methods for success, error, warning, info, and confirmation dialogs
 * with a consistent UX across the application.
 *
 * @example
 * constructor(private alert: AlertService) {}
 *
 * this.alert.success('Tournament created!');
 * this.alert.error('Failed to save tournament');
 */
@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly defaultTimer = 3000;
  private readonly confirmButtonColor = '#3b82f6'; // blue-500
  private readonly cancelButtonColor = '#ef4444'; // red-500

  /**
   * Shows a success alert
   * @param message - Main message to display
   * @param title - Optional title (defaults to 'Success!')
   */
  success(message: string, title: string = 'Success!'): Promise<SweetAlertResult> {
    return this.showAlert('success', title, message);
  }

  /**
   * Shows an error alert
   * @param message - Error message to display
   * @param title - Optional title (defaults to 'Error!')
   */
  error(message: string, title: string = 'Error!'): Promise<SweetAlertResult> {
    return this.showAlert('error', title, message, { timer: 0, showConfirmButton: true });
  }

  /**
   * Shows a warning alert
   * @param message - Warning message to display
   * @param title - Optional title (defaults to 'Warning!')
   */
  warning(message: string, title: string = 'Warning!'): Promise<SweetAlertResult> {
    return this.showAlert('warning', title, message);
  }

  /**
   * Shows an info alert
   * @param message - Info message to display
   * @param title - Optional title (defaults to 'Info')
   */
  info(message: string, title: string = 'Info'): Promise<SweetAlertResult> {
    return this.showAlert('info', title, message);
  }

  /**
   * Shows a confirmation dialog
   * @param config - Configuration options for the confirmation dialog
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  async confirm(config: AlertConfig): Promise<boolean> {
    const result = await Swal.fire({
      title: config.title || 'Are you sure?',
      text: config.text || '',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: config.confirmButtonText || 'Yes, proceed',
      cancelButtonText: config.cancelButtonText || 'Cancel',
      confirmButtonColor: this.confirmButtonColor,
      cancelButtonColor: this.cancelButtonColor,
      focusCancel: true,
      reverseButtons: true
    });

    return result.isConfirmed;
  }

  /**
   * Shows a loading spinner
   * @param message - Loading message to display
   */
  loading(message: string = 'Loading...'): void {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Closes any open alert
   */
  close(): void {
    Swal.close();
  }

  /**
   * Private method to show alerts with consistent configuration
   */
  private showAlert(
    icon: SweetAlertIcon,
    title: string,
    message: string,
    config: Partial<AlertConfig> = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      icon,
      title,
      text: message,
      timer: config.timer !== undefined ? config.timer : this.defaultTimer,
      showConfirmButton: config.showConfirmButton !== undefined ? config.showConfirmButton : false,
      timerProgressBar: true,
      toast: false,
      position: 'center',
      confirmButtonColor: this.confirmButtonColor
    });
  }
}
