# Integración MercadoPago — Referencia

## Requisitos

- Node.js 18+
- SDK oficial: `npm install mercadopago`
- Cuenta de MercadoPago con **Access Token** (productivo o de prueba)
- Servidor con HTTPS accesible públicamente (para el webhook)

## Configuración

```env
# .env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-123456789-...
```

## Estructura

```
backend/
├── src/
│   ├── config/
│   │   └── env.js          ← lee MERCADOPAGO_ACCESS_TOKEN
│   └── routes/
│       └── mercadopago.js  ← endpoints de MP
frontend/
├── src/
│   ├── components/
│   │   └── CartDrawer.vue  ← botón "Pagar con MP"
│   └── App.vue             ← verifica estado post-pago
```

## Endpoints

### 1. `POST /api/mercadopago/create-preference`

Crea una preferencia de pago en MP y una orden en DB.

**Request:**
```json
{
  "items": [{ "product_id": 1, "product_name": "Martillo", "quantity": 2, "unit_price": 8900 }],
  "combos": [{ "combo_id": 1, "combo_name": "Kit Básico", "price": 21900 }],
  "subtotal": 39700,
  "shipping": 0,
  "discount": 0,
  "total": 39700,
  "customer_name": "Juan",
  "customer_phone": "542920286288",
  "delivery_type": "retiro",
  "address": null,
  "pickup_date": "2026-06-28",
  "pickup_time": "18:00"
}
```

**Lógica:**
1. Abre transacción, inserta en `orders` + `order_items` + `order_combos`
2. Crea una `Preference` de MP con los items del carrito
3. Asigna `external_reference` = `JSON.stringify({ order_id })`
4. Asigna `notification_url` = `${baseUrl}/api/mercadopago/webhook`
5. Guarda `mp_preference_id` en la orden
6. Devuelve `{ preference_id, init_point, order_id }`

**Response:**
```json
{
  "preference_id": "123456789-abc",
  "init_point": "https://www.mercadopago.com.ar/...",
  "order_id": 42
}
```

---

### 2. `POST /api/mercadopago/webhook`

MercadoPago envía notificaciones aquí cuando cambia el estado de un pago. Debe responder **200** rápido para que MP no reintente.

**Lógica:**
1. Responde 200 inmediatamente (`res.sendStatus(200)`)
2. Extrae `paymentId` del body o query string
3. Usa el SDK para obtener los datos del pago (`payment.get({ id: paymentId })`)
4. Lee `external_reference` para saber qué `order_id` corresponde
5. Si el status es `approved`, actualiza la orden a `status = 'confirmado'`
6. Guarda `mp_payment_id` y `mp_status` en la orden

**Nota:** MP envía varios tipos de notificaciones. Este código filtra solo `type === 'payment'` o `topic === 'payment'`.

---

### 3. `GET /api/mercadopago/webhook`

MP (y algunos proxies) verifican que el endpoint existe. Solo responder 200.

---

### 4. `POST /api/mercadopago/check-status`

Lo llama el frontend cuando el usuario vuelve de MP con `collection_status=approved` en la URL.

**Request:**
```json
{
  "payment_id": "12345678",
  "preference_id": "123456789-abc"
}
```

**Response:**
```json
{
  "mp_status": "approved",
  "mp_payment_id": "12345678",
  "status": "confirmado"
}
```

## Flujo completo

```
Usuario                Frontend                     Backend                       MP
  │                       │                            │                          │
  │  click "Pagar MP"     │                            │                          │
  │──────────────────────>│                            │                          │
  │                       │  POST /create-preference   │                          │
  │                       │───────────────────────────>│                          │
  │                       │                            │  crea orden en DB        │
  │                       │                            │  crea Preference en MP   │
  │                       │                            │──────────────────────────>│
  │                       │                            │                          │
  │                       │  { init_point }            │                          │
  │                       │<───────────────────────────│                          │
  │                       │                            │                          │
  │                       │  redirect a MP             │                          │
  │                       │──────────────────────────────────────────────────────>│
  │                       │                            │                          │
  │  paga en MP           │                            │                          │
  │──────────────────────────────────────────────────────────────────────────────>│
  │                       │                            │                          │
  │                       │                            │  POST /webhook           │
  │                       │                            │<──────────────────────────│
  │                       │                            │  responde 200            │
  │                       │                            │  consulta payment.get()  │
  │                       │                            │  actualiza orden         │
  │                       │                            │                          │
  │  vuelve a la tienda   │                            │                          │
  │  con ?status=approved  │                            │                          │
  │──────────────────────>│                            │                          │
  │                       │  POST /check-status        │                          │
  │                       │───────────────────────────>│                          │
  │                       │  { status: "confirmado" }  │                          │
  │                       │<───────────────────────────│                          │
  │                       │                            │                          │
  │  alert("Pago ok")     │                            │                          │
  │<──────────────────────│                            │                          │
```

## Modelo de datos

Tabla `orders` (columnas relevantes para MP):

| Columna | Tipo | Uso |
|---|---|---|
| `payment_method` | VARCHAR | `'mercadopago'` o `'efectivo'` |
| `mp_preference_id` | VARCHAR | ID de la preferencia en MP |
| `mp_payment_id` | VARCHAR | ID del pago en MP (llega por webhook) |
| `mp_status` | VARCHAR | Estado del pago según MP (`approved`, `pending`, `rejected`) |
| `status` | VARCHAR | Estado interno: `pendiente` → `confirmado` cuando MP aprueba |

## Notas importantes

1. **Import dinámico:** El SDK de MP se importa con `await import('mercadopago')` solo dentro de los endpoints que lo usan, para no ralentizar el arranque del servidor.

2. **Webhook timeout:** MP espera una respuesta rápida. Por eso el `res.sendStatus(200)` está antes del procesamiento.

3. **external_reference:** Es el puente entre el pago en MP y la orden en tu DB. MP lo devuelve intacto en el webhook.

4. **HTTPS:** MP solo envía webhooks a URLs HTTPS. En desarrollo usá un túnel como `ngrok`.

5. **Idempotencia:** MP puede enviar el mismo webhook varias veces. Las `UPDATE` son idempotentes porque usan el mismo `mp_payment_id`.

6. **URL del webhook:** Se construye dinámicamente a partir del `Host` header:
   ```js
   const baseUrl = `${protocol}://${host}`;
   notification_url: `${baseUrl}/api/mercadopago/webhook`
   ```

## SDK usado

- Paquete: [`mercadopago`](https://www.npmjs.com/package/mercadopago) v3
- Clases usadas: `MercadoPagoConfig`, `Preference`, `Payment`
- Doc oficial: https://www.mercadopago.com.ar/developers/es/docs
