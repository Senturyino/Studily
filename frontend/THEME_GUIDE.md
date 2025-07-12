# 🎨 Studily Unified Theme Guide

This guide documents the unified theme system that ensures consistency across all Studily pages.

## 🎯 Theme Overview

The Studily theme uses a modern, professional design with:
- **Primary Gradient**: Purple to blue gradient (#667eea to #764ba2)
- **Glassmorphism**: Translucent cards with backdrop blur
- **Consistent Typography**: Segoe UI font family
- **Responsive Design**: Mobile-first approach
- **Modern Interactions**: Smooth animations and hover effects

## 📁 File Structure

```
frontend/
├── studily-theme.css          # Unified theme (include first)
├── responsive-system.css      # Responsive utilities
├── THEME_GUIDE.md            # This guide
└── [page-specific CSS files] # Page-specific styles
```

## 🔧 Implementation

### 1. Include Theme CSS (Required)
```html
<link rel="stylesheet" href="../studily-theme.css">
<link rel="stylesheet" href="page-specific.css">
```

### 2. Use Theme Classes
```html
<!-- Brand Header (Required on all pages) -->
<div class="brand-header">
    <h1 class="brand-title">Studily</h1>
    <p class="brand-subtitle">School Management System</p>
</div>

<!-- Container -->
<div class="container">
    <!-- Page content -->
</div>

<!-- Cards -->
<div class="card">
    <h3>Card Title</h3>
    <p>Card content</p>
</div>

<!-- Buttons -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-danger">Danger Button</button>
```

## 🎨 CSS Custom Properties

### Colors
```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --primary-color: #667eea;
    --primary-dark: #764ba2;
    --secondary-color: #4a5568;
    --text-primary: #2d3748;
    --text-secondary: #4a5568;
    --bg-card: rgba(255, 255, 255, 0.95);
    --border-color: #e2e8f0;
}
```

### Spacing
```css
:root {
    --spacing-xs: 0.25rem;   /* 4px */
    --spacing-sm: 0.5rem;    /* 8px */
    --spacing-md: 1rem;      /* 16px */
    --spacing-lg: 1.5rem;    /* 24px */
    --spacing-xl: 2rem;      /* 32px */
}
```

### Border Radius
```css
:root {
    --radius-sm: 8px;
    --radius-md: 15px;
    --radius-lg: 20px;
    --radius-xl: 25px;
}
```

## 🎯 Component Library

### Brand Header
```html
<div class="brand-header">
    <h1 class="brand-title">Studily</h1>
    <p class="brand-subtitle">School Management System</p>
</div>
```

### Cards
```html
<div class="card">
    <h3>Card Title</h3>
    <p>Card content with glassmorphism effect.</p>
    <button class="btn btn-primary">Action</button>
</div>
```

### Forms
```html
<form>
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" required>
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### Tables
```html
<div class="table-container">
    <table>
        <thead>
            <tr>
                <th>Header 1</th>
                <th>Header 2</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Data 1</td>
                <td>Data 2</td>
            </tr>
        </tbody>
    </table>
</div>
```

### Modals
```html
<div class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Modal Title</h2>
            <span class="close">&times;</span>
        </div>
        <div class="modal-body">
            <!-- Modal content -->
        </div>
    </div>
</div>
```

### Status Badges
```html
<span class="status-badge status-active">Active</span>
<span class="status-badge status-inactive">Inactive</span>
```

## 🔧 Utility Classes

### Spacing
```css
.mb-0, .mb-1, .mb-2, .mb-3, .mb-4, .mb-5  /* Margin bottom */
.mt-0, .mt-1, .mt-2, .mt-3, .mt-4, .mt-5  /* Margin top */
.p-0, .p-1, .p-2, .p-3, .p-4, .p-5       /* Padding */
```

### Layout
```css
.flex, .flex-column, .flex-wrap, .flex-center, .flex-between
.grid, .grid-1, .grid-2, .grid-3, .grid-4
```

### Text
```css
.text-center, .text-left, .text-right
.hidden, .visible
```

## 📱 Responsive Design

### Breakpoints
- **Mobile Small**: 0-480px
- **Mobile**: 481-768px
- **Tablet**: 769-1024px
- **Desktop**: 1025-1200px
- **Desktop Large**: 1201px+

### Mobile Optimizations
- Touch-friendly buttons (min 44px)
- Stacked layouts on small screens
- Hidden less important table columns
- Full-width buttons on mobile

## 🎨 Design Principles

### 1. Glassmorphism
- Translucent backgrounds with backdrop blur
- Subtle shadows and borders
- Modern, clean appearance

### 2. Gradient Usage
- Primary gradient for buttons and headers
- Consistent color scheme throughout
- Professional appearance

### 3. Typography
- Segoe UI font family
- Clear hierarchy with font weights
- Readable text sizes

### 4. Interactions
- Smooth transitions (0.3s ease)
- Hover effects with transform
- Consistent button styling

## 🔄 Theme Updates

### Adding New Components
1. Add CSS to `studily-theme.css`
2. Use CSS custom properties for consistency
3. Include responsive design
4. Document in this guide

### Modifying Colors
1. Update CSS custom properties in `:root`
2. Test across all pages
3. Ensure accessibility compliance

### Adding New Pages
1. Include `studily-theme.css` first
2. Add page-specific CSS after
3. Use theme classes and components
4. Test responsive design

## 🎯 Best Practices

### 1. CSS Loading Order
```html
<!-- Load theme first -->
<link rel="stylesheet" href="../studily-theme.css">
<!-- Then page-specific styles -->
<link rel="stylesheet" href="page-specific.css">
```

### 2. Component Usage
- Always use theme classes when available
- Extend theme components rather than replacing
- Maintain consistent spacing and typography

### 3. Responsive Design
- Test on all device sizes
- Use mobile-first approach
- Ensure touch-friendly interactions

### 4. Accessibility
- Maintain color contrast ratios
- Use semantic HTML
- Include proper focus states

## 🔧 Troubleshooting

### Common Issues
1. **Theme not loading**: Check file path in link tag
2. **Styles not applying**: Ensure theme CSS loads before page CSS
3. **Responsive issues**: Test on actual devices
4. **Color inconsistencies**: Use CSS custom properties

### Debug Steps
1. Check browser developer tools
2. Verify CSS file loading order
3. Test on different devices
4. Validate HTML structure

## 📋 Checklist for New Pages

- [ ] Include `studily-theme.css`
- [ ] Add brand header
- [ ] Use theme components (cards, buttons, forms)
- [ ] Test responsive design
- [ ] Validate accessibility
- [ ] Check color consistency
- [ ] Test on mobile devices

---

**Remember**: The theme ensures consistency across all Studily pages. Always use theme components when available! 