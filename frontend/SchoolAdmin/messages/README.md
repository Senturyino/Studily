# Messaging System - Studily

A comprehensive messaging and announcement system for the Studily School Management System that allows administrators to send messages and announcements to students and teachers.

## Features

### Admin Messaging Dashboard
- **Message Management**: Send announcements and messages to students and teachers
- **Targeting Options**: 
  - Send to all students
  - Send to all teachers
  - Send to specific students
  - Send to specific teachers
  - Send to specific classes
  - Send to everyone (students + teachers)
- **Message Types**: Announcements and regular messages
- **Priority Levels**: Normal, Important, and Urgent
- **Message History**: View and manage sent messages
- **Statistics**: Track message counts and recipient statistics

### Student Dashboard
- **Message Viewing**: View messages and announcements sent by admins
- **Search & Filter**: Search messages and filter by type and priority
- **Read Status**: Track read/unread messages
- **Message Details**: View full message content in modal
- **Quick Actions**: Mark all messages as read

### Teacher Dashboard
- **Message Viewing**: View messages and announcements sent by admins
- **Search & Filter**: Search messages and filter by type and priority
- **Read Status**: Track read/unread messages
- **Message Details**: View full message content in modal
- **Quick Actions**: Mark all messages as read

## File Structure

```
frontend/
├── SchoolAdmin/
│   └── messages/
│       ├── manage-messages.html      # Admin messaging interface
│       ├── manage-messages.css       # Admin messaging styles
│       ├── manage-messages.js        # Admin messaging functionality
│       └── README.md                 # This documentation
├── Student Dashboard UI/
│   ├── messages.html                 # Student message viewing
│   ├── messages.css                  # Student message styles
│   └── messages.js                   # Student message functionality
└── teacher/
    ├── messages.html                 # Teacher message viewing
    ├── messages.css                  # Teacher message styles
    └── messages.js                   # Teacher message functionality
```

## Usage

### For Administrators

1. **Access the Messaging System**
   - Navigate to `frontend/SchoolAdmin/messages/manage-messages.html`
   - This provides the admin interface for sending messages

2. **Send Messages**
   - Click "Send Message" button
   - Choose message type (Announcement or Message)
   - Set priority level (Normal, Important, Urgent)
   - Enter subject and content
   - Select recipients using the tabbed interface:
     - **Students Tab**: Send to all students or select specific students
     - **Teachers Tab**: Send to all teachers or select specific teachers
     - **Classes Tab**: Send to all classes or select specific classes
   - Click "Send Message"

3. **Quick Actions**
   - Use the quick action buttons for common scenarios:
     - "Announcement to All Students"
     - "Announcement to All Teachers"
     - "Announcement to Everyone"
     - "Custom Message"

4. **View Message History**
   - View all sent messages in the message history table
   - Filter by message type and recipient type
   - View message details by clicking the eye icon
   - Delete messages using the trash icon

### For Students

1. **Access Messages**
   - Navigate to `frontend/Student Dashboard UI/messages.html`
   - View all messages sent by administrators

2. **Message Features**
   - Search messages using the search box
   - Filter by message type (Announcement/Message) and priority
   - Click on any message to view full details
   - Messages are automatically marked as read when opened
   - Use "Mark All as Read" to mark all messages as read

3. **Message Display**
   - Unread messages are highlighted with a blue left border
   - Message preview shows first 100 characters
   - Priority badges indicate message importance
   - Date formatting shows relative time (Today, Yesterday, etc.)

### For Teachers

1. **Access Messages**
   - Navigate to `frontend/teacher/messages.html`
   - View all messages sent by administrators

2. **Message Features**
   - Same functionality as student dashboard
   - Teacher-specific styling with orange accent colors
   - Professional development and staff-related message examples

## Technical Details

### Message Types
- **Announcement**: General announcements to the school community
- **Message**: Direct communications to specific recipients

### Priority Levels
- **Normal**: Standard communications
- **Important**: Requires attention but not urgent
- **Urgent**: Time-sensitive or critical information

### Targeting Options
- **All Students**: Sends to every enrolled student
- **All Teachers**: Sends to every teacher
- **Specific Students**: Select individual students from a searchable list
- **Specific Teachers**: Select individual teachers from a searchable list
- **Specific Classes**: Send to all students in selected classes
- **Everyone**: Combines all students and teachers

### Data Structure
Messages include the following fields:
- `id`: Unique message identifier
- `type`: "announcement" or "message"
- `subject`: Message subject line
- `content`: Full message content
- `priority`: "normal", "important", or "urgent"
- `date`: Timestamp when message was sent
- `recipients`: List of target recipients
- `status`: "Sent" or "Draft"
- `read`: Boolean indicating if message has been read (for recipients)

## Styling

The messaging system uses the Studily unified theme with:
- Consistent color scheme and typography
- Responsive design for mobile and desktop
- Modern card-based layout
- Smooth animations and transitions
- Accessibility features

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

- Real-time notifications using WebSockets
- Message templates for common announcements
- Scheduled message sending
- Message attachments (files, images)
- Message threading and replies
- Email integration for external notifications
- Message analytics and reporting
- Multi-language support

## Integration Notes

The messaging system is designed to integrate with:
- User authentication system
- Student and teacher databases
- Class management system
- Notification system
- Email service for external notifications

## Security Considerations

- Message content should be sanitized to prevent XSS attacks
- Recipient validation to ensure messages only go to intended recipients
- Access control to ensure only admins can send messages
- Message retention policies for data privacy compliance 