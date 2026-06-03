import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SchemaService } from '../../services/schema.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings implements OnInit {
  bookingForm!: FormGroup;
  status = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  errorMessage = signal<string>('');

  // Dropdown list options
  timeSlots: string[] = [
    '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'
  ];

  guestOptions: number[] = Array.from({ length: 20 }, (_, i) => i + 1);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private schemaService: SchemaService
  ) {}

  ngOnInit(): void {
    // Inject schema structured data
    this.schemaService.injectSchema();

    // Initialize Form with validation constraints
    const today = new Date().toISOString().split('T')[0];
    
    this.bookingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      mobile: ['', [Validators.required, Validators.pattern('^(?:\\+?61|0)4\\d{8}$|^\\d{8,12}$')]], // Focuses on Aussie mobiles/local numbers
      date: [today, [Validators.required]],
      time: ['', [Validators.required]],
      guests: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.status.set('submitting');
    this.errorMessage.set('');

    const formValues = this.bookingForm.value;

    // Build Payload for Web3Forms static endpoint
    const payload = {
      access_key: environment.web3formsAccessKey,
      subject: `New Reservation - ${formValues.name} (${formValues.guests} Guests)`,
      from_name: 'The Northern Grid Reservation System',
      name: formValues.name,
      mobile: formValues.mobile,
      date: formValues.date,
      time: formValues.time,
      guests: formValues.guests,
      notes: formValues.notes || 'No special requirements.'
    };

    // Send HTTP POST request to Web3Forms
    this.http.post('https://web3forms.com/submit', payload)
      .subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.status.set('success');
            this.bookingForm.reset({
              name: '',
              mobile: '',
              date: new Date().toISOString().split('T')[0],
              time: '',
              guests: 2,
              notes: ''
            });
          } else {
            this.status.set('error');
            this.errorMessage.set(response.message || 'An unexpected error occurred. Please try again.');
          }
        },
        error: (err) => {
          this.status.set('error');
          this.errorMessage.set('Could not send booking request. Please check your internet connection and try again.');
          console.error('Reservation API Error:', err);
        }
      });
  }

  // Getters for form validation states
  isInvalid(controlName: string): boolean {
    const control = this.bookingForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
