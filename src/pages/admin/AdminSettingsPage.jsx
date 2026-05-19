import { useState, useEffect, useCallback } from 'react'
import { api } from '../../lib/api'
import { Loader2, Save } from 'lucide-react'

function Field({ label, field, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="block text-[12px] text-body mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full input-theme px-3 py-2 text-[13px] rounded-lg"
      />
    </div>
  )
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.admin.getSettings().then((d) => {
      const s = d.settings
      const initial = {
        site_name: s.site_name || '',
        phone: s.phone || '',
        telegram: s.telegram || '',
        min_recharge: s.min_recharge || '10000',
        bank_name: '', account_number: '', account_holder: '', note_format: '',
        crypto_network: '', crypto_address: '', crypto_rate: '',
      }
      if (s.bank_info) {
        try {
          const b = JSON.parse(s.bank_info)
          Object.assign(initial, { bank_name: b.bank_name, account_number: b.account_number, account_holder: b.account_holder, note_format: b.note_format })
        } catch {}
      }
      if (s.crypto_address) {
        try {
          const c = JSON.parse(s.crypto_address)
          Object.assign(initial, { crypto_network: c.network, crypto_address: c.address, crypto_rate: c.rate })
        } catch {}
      }
      setSettings(initial)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      await api.admin.updateSettings({
        site_name: settings.site_name,
        phone: settings.phone,
        telegram: settings.telegram,
        min_recharge: settings.min_recharge,
        bank_info: JSON.stringify({ bank_name: settings.bank_name, account_number: settings.account_number, account_holder: settings.account_holder, note_format: settings.note_format }),
        crypto_address: JSON.stringify({ network: settings.crypto_network, address: settings.crypto_address, rate: settings.crypto_rate }),
      })
      setMsg('Lưu thành công!')
    } catch (err) { setMsg('Lỗi: ' + err.message) }
    setSaving(false)
  }

  const update = useCallback((k, v) => setSettings((s) => ({ ...s, [k]: v })), [])

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={28} /></div>

  return (
    <div>
      <h1 className="text-[22px] font-bold text-heading mb-6">Cài đặt hệ thống</h1>

      <div className="space-y-6 max-w-2xl">
        <div className="card p-5">
          <h2 className="text-[15px] font-semibold text-heading mb-4">Thông tin chung</h2>
          <div className="space-y-4">
            <Field label="Tên website" field="site_name" value={settings.site_name} onChange={update} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Số điện thoại" field="phone" value={settings.phone} onChange={update} />
              <Field label="Telegram" field="telegram" value={settings.telegram} onChange={update} />
            </div>
            <Field label="Nạp tiền tối thiểu (VNĐ)" field="min_recharge" type="number" value={settings.min_recharge} onChange={update} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-[15px] font-semibold text-heading mb-4">Thông tin ngân hàng</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tên ngân hàng" field="bank_name" value={settings.bank_name} onChange={update} />
              <Field label="Số tài khoản" field="account_number" value={settings.account_number} onChange={update} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Chủ tài khoản" field="account_holder" value={settings.account_holder} onChange={update} />
              <Field label="Nội dung chuyển khoản" field="note_format" value={settings.note_format} onChange={update} />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-[15px] font-semibold text-heading mb-4">Crypto</h2>
          <div className="space-y-4">
            <Field label="Network" field="crypto_network" value={settings.crypto_network} onChange={update} />
            <Field label="Địa chỉ ví" field="crypto_address" value={settings.crypto_address} onChange={update} />
            <Field label="Tỷ giá" field="crypto_rate" value={settings.crypto_rate} onChange={update} />
          </div>
        </div>

        {msg && <div className={`text-[13px] font-medium ${msg.startsWith('Lỗi') ? 'text-red-400' : 'text-green-400'}`}>{msg}</div>}

        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 btn-primary px-6 py-2.5 rounded-xl text-[14px] disabled:opacity-60">
          <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  )
}
