import { getDistance } from './getDistance'; 

describe('Test de la fonction getDistance', () => {
  it('devrait retourner 0 si les coordonnées sont identiques', () => {
    const distance = getDistance({ lat: 45.75, lng: 4.85 }, { lat: 45.75, lng: 4.85 });
    expect(distance).toBe(0);
  });
});