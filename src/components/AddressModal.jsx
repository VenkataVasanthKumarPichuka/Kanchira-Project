import { useState } from 'react'
import { addAddress } from '../services/api'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

export default function AddressModal({ onClose, onSave }) {
  const { user } = useApp()
  const [form, setForm] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name || !form.street || !form.city || !form.pincode) {
      toast.error('Please fill required fields')
      return
    }
    setSaving(true)
    try {
      await addAddress({ ...form, userId: user?._id || user?.id })
      onSave(form)
      toast.success('Address saved!')
      onClose()
    } catch {
      // Save locally anyway
      onSave(form)
      onClose()
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="absolute top-3 right-4 text-2xl text-gray-400" onClick={onClose}>×</button>
        <h3 className="text-lg font-bold mb-4">Add Delivery Address</h3>
        <div className="flex flex-col gap-3">
          {[
            { key: 'name', label: 'Full Name', placeholder: 'Full Name' },
            { key: 'phone', label: 'Phone', placeholder: 'Phone Number' },
            { key: 'street', label: 'Street', placeholder: 'Street / Area' },
            { key: 'city', label: 'City', placeholder: 'City' },
            { key: 'state', label: 'State', placeholder: 'State' },
            { key: 'pincode', label: 'Pincode', placeholder: 'Pincode' },
          ].map(f => (
            <input
              key={f.key}
              className="form-input"
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            />
          ))}
          <button className="btn-maroon" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </div>
    </div>
  )
}
