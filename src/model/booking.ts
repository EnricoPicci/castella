import {
  format,
  differenceInCalendarDays
} from 'date-fns';

import {User} from '../model/user';
import {CalendarEvent} from 'angular-calendar';

export class Booking {
    $key: string;
    user: User;
    guests: number = 4;
    event: CalendarEvent;
    status = Booking.status.pending;

    record;

    /*constructor(
        $key?: string,
        event?: {start: string, end: string, title: string},
        guests?: number,
        status?: {text: string},
        user?: {uid: string, name: string, email: string}
    ) {
        this.$key = $key;
        // if $key is not null, it means that the data comes from DB
        if ($key) {
            this.status = Booking.status[status.text];
            this.event = {
                start: new Date(event.start),
                end: new Date(event.end),
                title: event.title,
                color: this.status.color
            };
            this.guests = guests;
            let user = new User();
            user.
        }
    }*/
    constructor() {
        let newEvent = {
            start: null,
            end: null,
            title: null,
            color: Booking.status.pending.color
        };
        this.event = newEvent;
    }

    getStartDateFormatted() : string {
        return this.formatDate(this.event.start)
    }
    getEndDateFormatted() : string {
        return this.formatDate(this.event.end)
    }
    getStartDateFormattedShort() {
        return this.formatDateShort(this.event.start)
    }
    getEndDateFormattedShort() {
        return this.formatDateShort(this.event.end)
    }
    private formatDate(date: Date) {
        return format(date, 'dd DD/MM/YYYY')
    }
    private formatDateShort(date: Date) {
        return format(date, 'dd DD/MM/YY')
    }
    duration() : number {
        return differenceInCalendarDays(this.event.end, this.event.start) + 1; 
    }
    getStatusColor() {
        // colors corresponding to the state have been added into theme/variables.scss
        return this.status.text;
    }
    isCancelled() {
        return this.status === Booking.status.cancelled
    }
    isNew() {
        return this.$key == null
    }
    
    /*static fromJsonList(array): Booking[] {
        return array.map(Booking.fromJson);
    }

    static fromJson({
        $key,
        event,
        guests,
        status,
        user
        }):Booking {
        return new Booking(
            $key,
            event,
            guests,
            status,
            user);
    }*/

    static colors: any = {
        red: {
            primary: '#ad2121',
            secondary: '#FAE3E3'
        },
        blue: {
            primary: '#1e90ff',
            secondary: '#D1E8FF'
        },
        yellow: {
            primary: '#e3bc08',
            secondary: '#FDF1BA'
        }
    };

    static status = {
        pending: {text: 'pending', color: Booking.colors.red},
        confirmed: {text: 'confirmed', color: Booking.colors.blue},
        cancelled: {text: 'cancelled', color: Booking.colors.yellow},
    }
}