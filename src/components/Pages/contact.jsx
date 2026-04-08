import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { submitContactForm } from '../services/api'
import logoImg from '../assets/images/Kanchira_logo[1]_page-0001.png'

function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function validate(values) {
  const errors = {};

  const fullName = values.fullName.trim();
  if (!fullName) errors.fullName = "FullName is required.";
  else if (fullName.length < 3) errors.fullName = "Must be at least 3 characters.";
  else if (!/^[a-zA-Z ]*$/.test(fullName)) errors.fullName = "Only letters and spaces allowed.";

  const email = values.email.trim();
  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

  const phone = values.phoneNumber.trim();
  if (!phone) errors.phoneNumber = "Phone number is required.";
  else if (!/^[0-9]{10}$/.test(phone)) errors.phoneNumber = "Enter a valid 10-digit mobile number.";

  const message = values.message.trim();
  if (!message) errors.message = "Message is required.";
  else if (message.length < 20) errors.message = "Must be at least 20 characters long.";

  return errors;
}

export default function ContactUsPage() {
  const navigate = useNavigate()
  const { user } = useApp()
  const userId = user?._id || user?.id

  const [values, setValues] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    message: '',
  })
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  const errors = useMemo(() => validate(values), [values])
  const isValid = Object.keys(errors).length === 0

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setNotice('')
    setTouched({ fullName: true, email: true, phoneNumber: true, message: true })

    if (!isValid) return

    setLoading(true)
    try {
      await submitContactForm({
        userId,
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        message: values.message.trim(),
      })
      setNotice('Form submitted successfully!')
      setValues({ fullName: '', email: '', phoneNumber: '', message: '' })
      setTouched({})
      window.setTimeout(() => setNotice(''), 2500)
    } catch (err) {
      setNotice(err?.response?.data?.message || err?.message || 'Something went wrong. Try again!')
      window.setTimeout(() => setNotice(''), 3500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '"DM Sans","Roboto",sans-serif' }}>
      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#681117] hover:bg-black/5"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#681117] hover:bg-black/5"
          >
            Home
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
          <div className="relative px-6 py-8 sm:px-10">
            <div className="absolute inset-0 bg-black/5" />
            <div className="relative">
              <h1 className="text-3xl font-extrabold text-[#810606]">Contact Us</h1>
              <p className="mt-2 text-sm font-medium text-[#7f0909]">
                Please Send Message For More Information
              </p>
            </div>
          </div>
        </div>

        {notice ? (
          <div className="mx-auto mt-5 w-full max-w-xl rounded-md border border-black/10 bg-white p-3 text-center text-sm font-semibold text-[#681117] shadow-sm">
            {notice}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={logoImg}
                  alt="Kanchira"
                  className="h-[70px] w-[100px] object-contain"
                />
                <div>
                  <div className="text-2xl font-extrabold text-[#470202]">{titleCase("Kanchira")}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xl font-extrabold text-[#470202]">Address</div>
                <p className="mt-2 text-sm text-black/70">
                  Road No. 15 Srinivasa Colony, Nagole, Hyderabad, Telangana 500068
                </p>
                <p className="mt-3 text-sm text-black/70">Dedicated Helpine (IST 9:00am to 6:00pm)</p>
                <p className="mt-1 text-sm text-black/70">Contact Number : 9963353171</p>
                <p className="mt-1 text-sm text-black/70">kanchira.india@gmail.com</p>
              </div>

              <div className="mt-6">
                <div className="text-xl font-extrabold text-[#470202]">Contact Timings</div>
                <p className="mt-2 text-sm text-black/70">Mon - Sat 10AM to 7PM</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm">
              <form onSubmit={onSubmit} className="mx-auto w-full max-w-[500px]">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black/80">Full Name</label>
                  <input
                    value={values.fullName}
                    onChange={(e) => setField("fullName", e.target.value.replace(/[^a-zA-Z ]+/g, ""))}
                    onBlur={() => touch("fullName")}
                    className="mt-2 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#DAA511]"
                    placeholder="Enter your full name"
                  />
                  {touched.fullName && errors.fullName ? (
                    <div className="mt-1 text-xs font-semibold text-red-600">{errors.fullName}</div>
                  ) : null}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black/80">Email</label>
                  <input
                    value={values.email}
                    onChange={(e) => setField("email", e.target.value)}
                    onBlur={() => touch("email")}
                    type="email"
                    className="mt-2 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#DAA511]"
                    placeholder="Enter your Email"
                  />
                  {touched.email && errors.email ? (
                    <div className="mt-1 text-xs font-semibold text-red-600">{errors.email}</div>
                  ) : null}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black/80">Phone Number</label>
                  <input
                    value={values.phoneNumber}
                    onChange={(e) => setField("phoneNumber", e.target.value.replace(/[^0-9]+/g, "").slice(0, 10))}
                    onBlur={() => touch("phoneNumber")}
                    inputMode="numeric"
                    className="mt-2 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#DAA511]"
                    placeholder="Enter your phone number"
                    maxLength={10}
                  />
                  {touched.phoneNumber && errors.phoneNumber ? (
                    <div className="mt-1 text-xs font-semibold text-red-600">{errors.phoneNumber}</div>
                  ) : null}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black/80">Purpose Of Enquiry/Message</label>
                  <input
                    value={values.message}
                    onChange={(e) => setField("message", e.target.value)}
                    onBlur={() => touch("message")}
                    className="mt-2 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#DAA511]"
                    placeholder="Enter the Message"
                  />
                  {touched.message && errors.message ? (
                    <div className="mt-1 text-xs font-semibold text-red-600">{errors.message}</div>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className={[
                    "w-full rounded-md bg-[#6c0202] px-4 py-2 text-sm font-extrabold text-white shadow-sm",
                    !isValid || loading ? "opacity-60" : "hover:bg-[#5a0101]",
                  ].join(" ")}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}