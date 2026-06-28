import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api.js'

export const useCartStore = defineStore('cart', () => {
  const items = ref({})
  const combos = ref({})
  const descuentoCodigo = ref(0)
  const codigoAplicado = ref(null)

  const totalItems = computed(() => {
    const productCount = Object.values(items.value).reduce((a, b) => a + b, 0)
    const comboCount = Object.values(combos.value).filter(Boolean).length
    return productCount + comboCount
  })

  const subtotal = computed(() => {
    let total = 0
    for (const [id, qty] of Object.entries(items.value)) {
      const p = productsMap.value[Number(id)]
      if (p) total += p.price * qty
    }
    for (const [cid, active] of Object.entries(combos.value)) {
      if (active) {
        const c = combosMap.value[cid]
        if (c) total += c.price
      }
    }
    return total
  })

  const productsMap = ref({})
  const combosMap = ref({})

  function setProductsMap(map) { productsMap.value = map }
  function setCombosMap(map) { combosMap.value = map }

  function changeQty(id, delta) {
    const cur = items.value[id] || 0
    const next = Math.max(0, cur + delta)
    if (next === 0) delete items.value[id]
    else items.value[id] = next
  }

  function toggleCombo(cid) {
    combos.value[cid] = !combos.value[cid]
  }

  function clear() {
    items.value = {}
    combos.value = {}
    descuentoCodigo.value = 0
    codigoAplicado.value = null
  }

  return { items, combos, descuentoCodigo, codigoAplicado, totalItems, subtotal, productsMap, combosMap, setProductsMap, setCombosMap, changeQty, toggleCombo, clear }
})
