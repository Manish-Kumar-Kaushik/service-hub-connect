UPDATE bookings b
SET provider_id = sp.id
FROM service_providers sp
WHERE b.provider_name = sp.name
  AND b.provider_id IS NULL;