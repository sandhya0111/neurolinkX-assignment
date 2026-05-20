export type ShipmentStatus = "Pending" | "In Transit" | "Delivered" | "Canceled";

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
}

// Initial robust dataset
const mockShipments: Shipment[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `${i + 1}`,
  trackingNumber: `N-LNK-00${1000 + i}`,
  origin: ['New York, NY', 'Chicago, IL', 'Seattle, WA', 'Austin, TX', 'Boston, MA'][i % 5],
  destination: ['Los Angeles, CA', 'Miami, FL', 'Houston, TX', 'Denver, CO', 'Las Vegas, NV'][i % 5],
  status: ['Pending', 'In Transit', 'Delivered', 'Canceled'][i % 4] as ShipmentStatus,
  estimatedDelivery: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
}));

// Simulate HTTP latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Fetch all shipments. (Would typically accept pagination args here)
 */
export async function getShipments(): Promise<Shipment[]> {
  await delay(700);
  // Simulating a successful fetch
  return [...mockShipments];
}

/**
 * Mutates the status of a specific shipment.
 * Designed with a random failure chance to demonstrate optimistic update rollbacks.
 */
export async function updateShipmentStatus(id: string, newStatus: ShipmentStatus): Promise<Shipment> {
  await delay(800);
  
  // 30% chance to fail to demonstrate robust mutation rollback error handling
  if (Math.random() < 0.3) {
    throw new Error(`Failed to update shipment ${id} to ${newStatus}. Simulator rejected request.`);
  }

  const index = mockShipments.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Shipment not found");
  
  mockShipments[index] = { ...mockShipments[index], status: newStatus };
  return mockShipments[index];
}
