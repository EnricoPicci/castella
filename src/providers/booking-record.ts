export interface BookingRecord {
    event: {start: Date, end: Date, title: string},
    guests: number,
    status: {text: string},
    userUid: string,
    userEmail: string,
    fee: number,
    $key?: string
}