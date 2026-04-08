import React, { useEffect, useMemo, useState } from "react";
import {
  addAddress,
  getAddressByUserId,
  getApiBase,
  getCart,
  getCouponByCode,
  getUserId,
  placeOrder,
  removeItemFromCart,
  titleCase,
  updateAddress,
  updateCartQuantity,
} from "./api";

/* ---------------- HELPERS ---------------- */
const formatINR = (val) =>
  new Intl.NumberFormat("en-IN").format(Math.round(Number(val || 0)));

const getDiscountedPrice = (price, discount) =>
  price - (price * discount) / 100;

/* ---------------- MAIN ---------------- */
export default function CartPage() {
  const API_BASE = useMemo(() => getApiBase(), []);
  const userId = useMemo(() => getUserId(), []);

  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  /* ---------- DISCOUNTS ---------- */
  const [coupon, setCoupon] = useState(null);
  const [spinDiscount, setSpinDiscount] = useState(0);

  const [payment, setPayment] = useState("COD");
  const [placing, setPlacing] = useState(false);

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          getCart({ apiBase: API_BASE, userId }),
          getAddressByUserId({ apiBase: API_BASE, userId }),
        ]);

        setCartItems(cartRes?.cart?.items || []);
        setAddress(addrRes?.address?.[0] || null);
      } catch (err) {
        setNotice("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [API_BASE, userId]);

  /* ---------- TOTALS ---------- */
  const baseTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.variant.price;
      const disc = item.variant.discountPercentage;
      return acc + getDiscountedPrice(price, disc) * item.quantity;
    }, 0);
  }, [cartItems]);

  const finalTotal = useMemo(() => {
    let total = baseTotal;

    // apply ONLY one discount
    if (spinDiscount > 0) {
      total -= (baseTotal * spinDiscount) / 100;
    } else if (coupon) {
      total -= coupon.value;
    }

    return Math.max(0, Math.round(total));
  }, [baseTotal, spinDiscount, coupon]);

  /* ---------- CART ACTIONS ---------- */
  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    const productId = item.productId._id;

    setCartItems((prev) =>
      prev.map((x) =>
        x._id === item._id ? { ...x, quantity: newQty } : x
      )
    );

    try {
      await updateCartQuantity({
        apiBase: API_BASE,
        userId,
        productId,
        quantity: newQty,
      });
    } catch {
      setNotice("Failed to update quantity");
    }
  };

  const removeItem = async (item) => {
    await removeItemFromCart({
      apiBase: API_BASE,
      payload: {
        userId,
        productId: item.productId._id,
      },
    });

    setCartItems((prev) => prev.filter((x) => x._id !== item._id));
  };

  /* ---------- COUPON ---------- */
  const applyCoupon = async (code) => {
    try {
      const res = await getCouponByCode({ apiBase: API_BASE, code });

      if (!res.active) {
        setNotice("Invalid coupon");
        return;
      }

      setCoupon({
        code,
        value:
          res.type === "percentage"
            ? (baseTotal * res.value) / 100
            : res.value,
      });

      setSpinDiscount(0); // remove spin if coupon used
    } catch {
      setNotice("Coupon error");
    }
  };

  /* ---------- ORDER ---------- */
  const placeOrderNow = async () => {
    if (!address) return setNotice("Add address first");

    setPlacing(true);

    try {
      const res = await placeOrder({
        apiBase: API_BASE,
        orderPayload: {
          userId,
          items: cartItems,
          totalAmount: finalTotal,
          address,
          paymentMethod: payment,
          couponCode: coupon?.code || "",
          spinDiscount,
        },
      });

      if (payment === "ONLINE" && res?.redirectUrlRes) {
        window.location.href = res.redirectUrlRes;
      } else {
        alert("Order placed!");
        window.location.href = "/orders";
      }
    } catch {
      setNotice("Order failed");
    } finally {
      setPlacing(false);
    }
  };

  /* ---------- UI ---------- */
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-12 gap-6">

      {/* LEFT CART */}
      <div className="md:col-span-8 space-y-4">
        {cartItems.map((item) => {
          const price = item.variant.price;
          const disc = item.variant.discountPercentage;
          const final = getDiscountedPrice(price, disc);

          return (
            <div key={item._id} className="flex gap-4 border p-4 rounded">

              <img src={item.image} className="w-28 h-28 object-cover" />

              <div className="flex-1">
                <h3 className="font-semibold">
                  {item.productId.name}
                </h3>

                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQty(item, -1)}>-</button>
                  {item.quantity}
                  <button onClick={() => updateQty(item, 1)}>+</button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold">₹{formatINR(final * item.quantity)}</p>
                <button onClick={() => removeItem(item)} className="text-red-500 text-sm">
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT SUMMARY */}
      <div className="md:col-span-4 border p-4 rounded space-y-3">

        <h3 className="font-bold">Price Details</h3>

        <p>Subtotal: ₹{formatINR(baseTotal)}</p>

        {coupon && (
          <p className="text-green-600">
            Coupon ({coupon.code}): -₹{formatINR(coupon.value)}
          </p>
        )}

        {spinDiscount > 0 && (
          <p className="text-green-600">
            Spin: -{spinDiscount}%
          </p>
        )}

        <hr />

        <p className="font-bold text-lg">
          Total: ₹{formatINR(finalTotal)}
        </p>

        {/* Coupon */}
        <button
          onClick={() => {
            const code = prompt("Enter coupon");
            if (code) applyCoupon(code);
          }}
          className="w-full border p-2"
        >
          Apply Coupon
        </button>

        {/* Payment */}
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          className="w-full border p-2"
        >
          <option value="COD">Cash on Delivery</option>
          <option value="ONLINE">Pay Online</option>
        </select>

        {/* Place Order */}
        <button
          onClick={placeOrderNow}
          disabled={placing}
          className="w-full bg-pink-600 text-white p-3 rounded"
        >
          {placing ? "Processing..." : "PLACE ORDER"}
        </button>

        {notice && <p className="text-red-500 text-sm">{notice}</p>}
      </div>
    </div>
  );
}