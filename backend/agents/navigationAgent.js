// Navigation Agent
// Computes route, calculates estimated walking time, and highlights nearby facilities.

export async function processNavigation(source, destination, prisma) {
  // Mock routing coordinates and path for SVG layout
  // Map dimensions are 800x500
  // Nodes:
  // Main Gate: (50, 450)
  // Hostel: (100, 100)
  // Main Library: (400, 200)
  // Cafeteria: (300, 350)
  // Washrooms (Block B): (550, 150)
  // Programming Lab (Block B, Room 302): (600, 120)
  // CSE Block Entrance: (500, 180)
  
  let routePath = '';
  let distance = 0; // meters
  let duration = 0; // minutes
  let steps = [];
  
  if (source === 'Hostel') {
    routePath = 'M 100 100 L 300 200 L 400 200 L 500 180 L 600 120';
    distance = 280;
    duration = 4;
    steps = [
      'Exit the hostel block and walk towards the central lawn.',
      'Pass the Main Library on your right.',
      'Enter the CSE Block and go up to the 3rd floor.',
      'Turn left; the Programming Lab (Room 302) is at the end of the corridor.'
    ];
  } else {
    // Main Gate
    routePath = 'M 50 450 L 300 350 L 400 200 L 500 180 L 600 120';
    distance = 420;
    duration = 6;
    steps = [
      'Enter from the Main Gate and walk down the main avenue.',
      'Pass the Cafeteria on your left.',
      'Turn right at the Central Circle towards the CSE Block.',
      'Enter CSE Block Entrance and proceed to the 3rd Floor.',
      'Room 302 (Programming Lab) will be on your left.'
    ];
  }

  const nearbyFacilities = [
    { name: 'Block B Restrooms', distance: '25m', type: 'washroom', coords: [550, 150] },
    { name: 'Central Library', distance: '120m', type: 'library', coords: [400, 200] },
    { name: 'Main Cafeteria', distance: '200m', type: 'cafeteria', coords: [300, 350] }
  ];

  return {
    source,
    destination,
    routePath,
    distance,
    duration,
    steps,
    nearbyFacilities
  };
}
