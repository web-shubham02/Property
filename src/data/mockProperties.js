export const mockProperties = [
  {
    id: 'prop-1',
    title: 'Premium Residential Plot in Green Meadows',
    price: 4500000, // 45 Lakhs
    location: 'Whitefield East, Bangalore',
    size: '2,400 Sq.Ft.',
    description: 'A premium north-facing residential villa plot in a secure gated community. Fully developed with clear boundaries, electricity, asphalt roads, and 24/7 security. Perfect for constructing your dream villa in Bangalore’s thriving tech hub.',
    status: 'Available',
    photos: ['/plot_residential.png'],
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: '2026-06-10T08:00:00Z',
    created_by: 'mock-agent-id'
  },
  {
    id: 'prop-2',
    title: 'Fertile Agricultural Land with Farmhouse Potential',
    price: 12500000, // 1.25 Crore
    location: 'Nelamangala, Bangalore Rural',
    size: '2.2 Acres',
    description: 'High-yield agricultural land featuring red fertile soil, fully functional borehole irrigation, and electrical connections. Beautiful panoramic views, ideal for a weekend getaway farmhouse, organic farming, or horticultural investment.',
    status: 'Available',
    photos: ['/plot_agricultural.png'],
    video_url: '',
    created_at: '2026-06-12T10:30:00Z',
    created_by: 'mock-agent-id'
  },
  {
    id: 'prop-3',
    title: 'Highway-Facing Prime Commercial Land',
    price: 29000000, // 2.9 Crore
    location: 'Hosur Road Bypass, Bangalore',
    size: '15,000 Sq.Ft.',
    description: 'Unmatched visibility and access right on the commercial bypass road. Highly suitable for commercial complex, warehousing, industrial depot, automotive showroom, or restaurant plaza. Clear title and commercial approvals ready.',
    status: 'Available',
    photos: ['/plot_commercial.png'],
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: '2026-06-15T14:00:00Z',
    created_by: 'mock-agent-id'
  },
  {
    id: 'prop-4',
    title: 'Exclusive Residential Plot Near Lakefront',
    price: 6800000, // 68 Lakhs
    location: 'Sarjapur Lakefront, Bangalore',
    size: '3,600 Sq.Ft.',
    description: 'Scenic residential plot offering serene lake views in a luxury enclave. Clear title deeds, immediate registration, wide access roads, and premium amenities. Walkable distance to major international schools.',
    status: 'Sold', // Sold plot to test filter and admin tables
    photos: ['/plot_residential.png'],
    video_url: '',
    created_at: '2026-06-18T11:15:00Z',
    created_by: 'mock-agent-id'
  }
];

export const formatPrice = (price) => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};
