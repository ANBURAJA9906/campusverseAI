// Field/endpoint definitions for the CRUD resources that share the same
// shape (list from a public read endpoint, mutate via the protected
// /api/admin/* endpoints). Announcements, Students, Overview and the Poster
// generator have their own bespoke tabs since they don't fit this pattern.

export const resourceConfigs = {
  clubs: {
    resourceLabel: 'Club',
    listPath: '/clubs',
    mutatePath: '/admin/clubs',
    titleField: 'name',
    subtitleField: 'category',
    bodyField: 'description',
    fields: [
      { name: 'name', label: 'Club Name', type: 'text', required: true, placeholder: 'e.g. AI Club' },
      { name: 'category', label: 'Category', type: 'text', required: true, placeholder: 'e.g. Technical' },
      { name: 'whatsappGroup', label: 'WhatsApp Group Link', type: 'text', required: true, placeholder: 'https://chat.whatsapp.com/...' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'What the club does...' }
    ]
  },
  events: {
    resourceLabel: 'Event',
    listPath: '/events',
    mutatePath: '/admin/events',
    titleField: 'name',
    subtitleField: 'type',
    bodyField: 'description',
    fields: [
      { name: 'name', label: 'Event Name', type: 'text', required: true, placeholder: 'e.g. HackVerse 2026' },
      { name: 'type', label: 'Type', type: 'text', required: true, placeholder: 'hackathon / seminar / cultural' },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'deadline', label: 'Registration Deadline', type: 'date', required: true },
      { name: 'location', label: 'Location', type: 'text', required: true, placeholder: 'e.g. Main Auditorium' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Event details...' }
    ]
  },
  hostels: {
    resourceLabel: 'Hostel',
    listPath: '/hostels',
    mutatePath: '/admin/hostels',
    titleField: 'name',
    subtitleField: 'type',
    bodyField: 'facilities',
    fields: [
      { name: 'name', label: 'Hostel Name', type: 'text', required: true, placeholder: 'e.g. Block C' },
      { name: 'type', label: 'Type', type: 'text', required: true, placeholder: 'Boys / Girls / PG' },
      { name: 'warden', label: 'Warden Name', type: 'text', required: true },
      { name: 'contact', label: 'Contact Number', type: 'text', required: true },
      { name: 'messTimings', label: 'Mess Timings', type: 'text', required: true, placeholder: 'e.g. 8-10, 1-2, 8-9:30' },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'facilities', label: 'Facilities', type: 'textarea', required: true, placeholder: 'Wi-Fi, laundry, gym...' }
    ]
  },
  library: {
    resourceLabel: 'Book',
    listPath: '/library',
    mutatePath: '/admin/library',
    titleField: 'title',
    subtitleField: 'author',
    bodyField: 'category',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true, placeholder: 'e.g. Computer Science' },
      { name: 'callNumber', label: 'Call Number', type: 'text', required: true },
      { name: 'totalCopies', label: 'Total Copies', type: 'number', required: false, placeholder: '1' },
      { name: 'availableCopies', label: 'Available Copies', type: 'number', required: false, placeholder: '1' }
    ]
  }
};
