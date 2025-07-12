# Academic Year Management

This module provides comprehensive management of academic years for the Studily School Management System. Administrators can create, edit, view, and delete academic years along with their associated semesters.

## Features

### Core Functionality
- **Create Academic Years**: Add new academic years with custom names, date ranges, and status
- **Manage Semesters**: Add multiple semesters to each academic year with individual start and end dates
- **Edit Academic Years**: Modify existing academic years and their semester configurations
- **View Details**: Comprehensive view of academic year information including statistics
- **Delete Academic Years**: Remove academic years with confirmation dialog
- **Search and Filter**: Find academic years by name, status, or year range

### Database Integration
- **Primary Key**: `acc_year` (Academic Year identifier)
- **Semester Management**: Dynamic semester creation and management
- **Status Tracking**: Active, Inactive, and Upcoming status options
- **Date Validation**: Ensures proper date ranges and semester overlaps

## File Structure

```
academicyear/
├── manage-academic-years.html    # Main interface
├── manage-academic-years.css     # Styling and responsive design
├── manage-academic-years.js      # JavaScript functionality
└── README.md                    # This documentation
```

## Database Schema

### Academic Years Table (`acc_year` as Primary Key)
```sql
CREATE TABLE academic_years (
    acc_year VARCHAR(20) PRIMARY KEY,
    year_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'upcoming') DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Semesters Table
```sql
CREATE TABLE semesters (
    semester_id INT AUTO_INCREMENT PRIMARY KEY,
    acc_year VARCHAR(20),
    semester_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (acc_year) REFERENCES academic_years(acc_year) ON DELETE CASCADE
);
```

## Usage

### Creating an Academic Year
1. Click "Create Academic Year" button
2. Fill in the required fields:
   - Academic Year (e.g., "2024-2025")
   - Year Name (e.g., "2024-2025 Academic Year")
   - Start Date and End Date
   - Status (Active/Inactive/Upcoming)
3. Add semesters using the "Add Semester" button
4. For each semester, provide:
   - Semester Name (e.g., "First Semester")
   - Start Date and End Date
5. Click "Create Academic Year" to save

### Managing Semesters
- **Add Semester**: Click "Add Semester" button to add new semesters
- **Remove Semester**: Click the trash icon next to any semester (minimum one semester required)
- **Edit Semesters**: Modify semester details in the edit modal

### Viewing Academic Year Details
- Click the eye icon to view comprehensive details including:
  - Basic information (year, name, status)
  - Date range and duration
  - List of all semesters
  - Statistics (total semesters, active students, classes)

## Features

### Responsive Design
- Mobile-friendly interface
- Adaptive table layout
- Touch-friendly buttons and controls

### Search and Filter
- **Search**: Find academic years by name or year
- **Status Filter**: Filter by Active, Inactive, or Upcoming
- **Year Filter**: Filter by specific academic years

### Validation
- **Date Validation**: Ensures end date is after start date
- **Semester Validation**: Requires at least one semester
- **Duplicate Prevention**: Prevents creation of duplicate academic years
- **Required Fields**: All mandatory fields must be completed

### Status Management
- **Active**: Currently running academic year
- **Inactive**: Completed or cancelled academic year
- **Upcoming**: Future academic year

## Integration Points

### Student Management
- Academic years are referenced in student enrollment
- Students are associated with specific academic years

### Class Management
- Classes are linked to academic years
- Semester-based class scheduling

### Results Management
- Results are organized by academic year and semester
- Grade tracking per semester

## API Endpoints (Future Implementation)

```javascript
// Create academic year
POST /api/academic-years
{
    "acc_year": "2024-2025",
    "year_name": "2024-2025 Academic Year",
    "start_date": "2024-09-01",
    "end_date": "2025-06-30",
    "status": "active",
    "semesters": [...]
}

// Get all academic years
GET /api/academic-years

// Update academic year
PUT /api/academic-years/{acc_year}

// Delete academic year
DELETE /api/academic-years/{acc_year}
```

## Styling

The interface uses the Studily unified theme with:
- Gradient backgrounds and modern card design
- Consistent color scheme (purple/blue gradients)
- Responsive grid layouts
- Smooth animations and transitions
- Accessible button and form styling

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- Font Awesome 6.0.0 (for icons)
- Studily Theme CSS (for consistent styling)
- Modern JavaScript (ES6+ features)

## Future Enhancements

- **Bulk Operations**: Import/export academic years
- **Templates**: Pre-defined academic year templates
- **Advanced Filtering**: Date range filters, semester-based filtering
- **Statistics Dashboard**: Visual charts and analytics
- **API Integration**: Full backend integration with database
- **Audit Trail**: Track changes and modifications
- **Multi-language Support**: Internationalization 