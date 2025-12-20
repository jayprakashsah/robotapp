import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Check, CreditCard, MapPin, User, Phone, Mail, 
  Loader2, ArrowRight, Package, Home, Building, 
  Navigation, Globe, Lock, Shield, AlertCircle,
  Calendar, Truck, Clock, ShieldCheck, XCircle,
  ChevronDown, CreditCard as Card, Wallet, Smartphone,
  Banknote, CheckCircle, Star, Heart, Zap,
  ShoppingBag, Gift, Truck as DeliveryTruck,
  Eye, EyeOff, Info, Heart as HeartIcon
} from 'lucide-react';
import orderService from '../services/orderService';
import productService from '../services/productService';

const OrderForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    // Initialize once when component mounts
    const savedAddress = JSON.parse(localStorage.getItem('saved_address') || '{}');
    return {
      fullName: localStorage.getItem('user_name') || savedAddress.fullName || '',
      email: localStorage.getItem('user_email') || savedAddress.email || '',
      phone: savedAddress.phone || '',
      addressLine1: savedAddress.addressLine1 || '',
      addressLine2: savedAddress.addressLine2 || '',
      city: savedAddress.city || '',
      state: savedAddress.state || '',
      postalCode: savedAddress.postalCode || '',
      country: savedAddress.country || 'India',
      landmark: savedAddress.landmark || '',
      addressType: savedAddress.addressType || 'home',
      paymentMethod: '',
      cardNumber: '',
      cardHolderName: '',
      cardExpiry: '',
      cardCVC: '',
      upiId: '',
      bankName: '',
      items: [],
      notes: '',
      useSameAddress: true,
      saveAddress: false,
      giftWrap: false,
      giftMessage: '',
      shippingSpeed: 'standard',
      showCardCVC: false
    };
  });
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  
  const suggestionsRef = useRef(null);
  const formRef = useRef(null);
  
  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  // Fetch product on mount
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        if (productId) {
          const response = await productService.getProductById(productId);
          if (response.success && response.product) {
            setProduct(response.product);
            setFormData(prev => ({
              ...prev,
              items: [{
                productId: response.product._id,
                productName: response.product.name,
                variant: response.product.variant,
                quantity: 1,
                price: response.product.discountPrice || response.product.price
              }]
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form validation effect
  useEffect(() => {
    validateCurrentStep();
  }, [formData, step]);

  // Address suggestions with debouncing
  useEffect(() => {
    if (addressQuery.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchAddressSuggestions(addressQuery);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [addressQuery]);

  const fetchAddressSuggestions = async (query) => {
    setAddressLoading(true);
    
    // Mock Google Places API
    const mockSuggestions = [
      {
        description: "123 Tech Park, Mumbai, Maharashtra 400001",
        main_text: "123 Tech Park",
        secondary_text: "Mumbai, Maharashtra 400001",
        street: "123 Tech Park",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India"
      },
      {
        description: "456 Innovation Street, Bangalore, Karnataka 560001",
        main_text: "456 Innovation Street",
        secondary_text: "Bangalore, Karnataka 560001",
        street: "456 Innovation Street",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        country: "India"
      },
      {
        description: "789 Startup Hub, Delhi, Delhi 110001",
        main_text: "789 Startup Hub",
        secondary_text: "Delhi, Delhi 110001",
        street: "789 Startup Hub",
        city: "Delhi",
        state: "Delhi",
        postalCode: "110001",
        country: "India"
      }
    ];

    setTimeout(() => {
      setAddressSuggestions(mockSuggestions);
      setAddressLoading(false);
      setShowSuggestions(true);
    }, 300);
  };

  const selectAddress = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      addressLine1: suggestion.street,
      city: suggestion.city,
      state: suggestion.state,
      postalCode: suggestion.postalCode,
      country: suggestion.country
    }));
    setAddressQuery(suggestion.description);
    setShowSuggestions(false);
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
        isValid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Valid email is required';
        isValid = false;
      }
      if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Valid 10-digit phone is required';
        isValid = false;
      }
    }

    if (step === 2) {
      if (!formData.addressLine1.trim()) {
        newErrors.addressLine1 = 'Address is required';
        isValid = false;
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
        isValid = false;
      }
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
        isValid = false;
      }
      if (!/^[0-9]{6}$/.test(formData.postalCode)) {
        newErrors.postalCode = 'Valid 6-digit postal code is required';
        isValid = false;
      }
    }

    if (step === 3) {
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = 'Payment method is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = (e) => {
    e.preventDefault();
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateOrderSummary = () => {
    if (!product) return { subtotal: 0, shipping: 0, tax: 0, total: 0, giftWrapCharge: 0 };
    
    const subtotal = (product.discountPrice || product.price) * (formData.items[0]?.quantity || 1);
    const shipping = {
      standard: 99,
      express: 199,
      next_day: 499
    }[formData.shippingSpeed] || 99;
    
    const tax = subtotal * 0.18;
    const giftWrapCharge = formData.giftWrap ? 149 : 0;
    const total = subtotal + shipping + tax + giftWrapCharge;
    
    return { subtotal, shipping, tax, giftWrapCharge, total };
  };

 // Replace the current handleSubmitOrder function with this:

const handleSubmitOrder = async (e) => {
  e.preventDefault();
  
  if (!validateCurrentStep() || !product) return;
  
  setSubmitting(true);
  
  try {
    const orderSummary = calculateOrderSummary();
    
    // Prepare complete order data
    const orderData = {
      items: formData.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      shippingAddress: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        landmark: formData.landmark,
        type: formData.addressType
      },
      paymentMethod: formData.paymentMethod,
      subtotal: orderSummary.subtotal,
      shippingCharge: orderSummary.shipping,
      tax: orderSummary.tax,
      totalAmount: orderSummary.total,
      notes: formData.notes,
      giftWrap: formData.giftWrap,
      giftMessage: formData.giftMessage,
      shippingSpeed: formData.shippingSpeed,
      userId: localStorage.getItem('user_id') // Make sure this is included
    };

    console.log('📦 Submitting order data:', orderData);
    
    // Call backend API via orderService
    const response = await orderService.createOrder(orderData);
    
    console.log('🎯 Order response:', response);
    
    if (response.success) {
      setOrderNumber(response.order.orderNumber || response.order._id);
      setSuccess(true);
      
      // Save address if requested
      if (formData.saveAddress) {
        const savedAddress = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          addressType: formData.addressType,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem('saved_address', JSON.stringify(savedAddress));
      }
      
      // Clear any pending orders from localStorage
      localStorage.removeItem('pending_orders');
      
    } else {
      throw new Error(response.message || 'Order failed to save to database');
    }
    
  } catch (error) {
  console.error('❌ Order submission error:', error);
  
  // Recalculate order summary for local storage
  const orderSummaryForLocal = calculateOrderSummary();
  
  // Save order locally if backend fails
  const localOrder = {
    items: formData.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      variant: item.variant,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    })),
    shippingAddress: {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      landmark: formData.landmark,
      type: formData.addressType
    },
    paymentMethod: formData.paymentMethod,
    subtotal: orderSummaryForLocal.subtotal,
    shippingCharge: orderSummaryForLocal.shipping,
    tax: orderSummaryForLocal.tax,
    totalAmount: orderSummaryForLocal.total,
    notes: formData.notes,
    giftWrap: formData.giftWrap,
    giftMessage: formData.giftMessage,
    shippingSpeed: formData.shippingSpeed,
    userId: localStorage.getItem('user_id'),
    localId: 'local-' + Date.now(),
    createdAt: new Date().toISOString(),
    status: 'pending_sync',
    orderStatus: 'pending',
    paymentStatus: 'pending',
    orderNumber: 'LOCAL-' + Date.now().toString().slice(-8)
  };
  
  const pendingOrders = JSON.parse(localStorage.getItem('pending_orders') || '[]');
  pendingOrders.push(localOrder);
  localStorage.setItem('pending_orders', JSON.stringify(pendingOrders));
  
  alert(`⚠️ Backend unavailable. Order saved locally. Order ID: ${localOrder.orderNumber}`);
  
  // Still show success for user experience
  setOrderNumber(localOrder.orderNumber);
  setSuccess(true);

  } finally {
    setSubmitting(false);
  }
};

  const renderStepIndicator = () => (
    <div className="mb-10">
      <div className="flex justify-between mb-6">
        {[
          { number: 1, label: 'Details', icon: User },
          { number: 2, label: 'Address', icon: MapPin },
          { number: 3, label: 'Payment', icon: CreditCard },
          { number: 4, label: 'Confirm', icon: Check }
        ].map(({ number, label, icon: Icon }) => (
          <motion.div 
            key={number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: number * 0.1 }}
            className="flex flex-col items-center relative flex-1"
          >
            <motion.div 
              animate={step === number ? pulseAnimation.animate : {}}
              className={`h-14 w-14 rounded-full flex items-center justify-center border-4 relative z-10 transition-all duration-300 ${
                step > number 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-transparent text-white'
                  : step === number
                  ? 'bg-gradient-to-br from-cyan-500 to-purple-600 border-transparent text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {step > number ? <Check size={24} /> : <Icon size={20} />}
            </motion.div>
            <span className={`mt-3 font-medium transition-colors ${
              step >= number ? 'text-white' : 'text-slate-500'
            }`}>
              {label}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${((step - 1) / 3) * 100}%` }}
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
        />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      key="step1"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
          <User className="text-cyan-400" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Personal Details</h2>
          <p className="text-slate-400">Enter your contact information</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <User size={16} /> Full Name *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none transition-all ${
              errors.fullName ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500'
            }`}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <Info size={12} /> {errors.fullName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Mail size={16} /> Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none transition-all ${
              errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500'
            }`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <Info size={12} /> {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Phone size={16} /> Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none transition-all ${
              errors.phone ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500'
            }`}
            placeholder="9876543210"
            maxLength="10"
          />
          {errors.phone && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <Info size={12} /> {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Globe size={16} /> Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
          >
            <option value="India">India</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <ShoppingBag size={16} /> Order Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-all min-h-[100px] resize-none"
          placeholder="Any special instructions for your order..."
        />
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <MapPin className="text-blue-400" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Delivery Address</h2>
          <p className="text-slate-400">Where should we deliver your order?</p>
        </div>
      </div>

      {/* Address Search */}
      <div className="space-y-2 relative" ref={suggestionsRef}>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Navigation size={16} /> Search Address *
        </label>
        <div className="relative">
          <input
            type="text"
            value={addressQuery}
            onChange={(e) => {
              setAddressQuery(e.target.value);
              handleInputChange('addressLine1', e.target.value);
            }}
            onFocus={() => addressQuery.length >= 3 && setShowSuggestions(true)}
            className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none transition-all pr-12 ${
              errors.addressLine1 ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500'
            }`}
            placeholder="Start typing your address..."
          />
          {addressLoading && (
            <div className="absolute right-4 top-4">
              <Loader2 className="animate-spin text-cyan-400" size={20} />
            </div>
          )}
          
          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && addressSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 bg-gradient-to-b from-[#0a0f1d] to-[#050b16] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
              >
                {addressSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    onClick={() => selectAddress(suggestion)}
                    className="w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex items-start gap-3"
                  >
                    <MapPin size={18} className="text-cyan-400 mt-1" />
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {suggestion.main_text}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        {suggestion.secondary_text}
                      </div>
                    </div>
                    <ChevronDown size={16} className="text-slate-500 rotate-90" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.addressLine1 && (
          <p className="text-red-400 text-sm flex items-center gap-1">
            <Info size={12} /> {errors.addressLine1}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Address Line 1 *</label>
          <input
            type="text"
            value={formData.addressLine1}
            onChange={(e) => handleInputChange('addressLine1', e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
            placeholder="House no, Building, Street"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Address Line 2</label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) => handleInputChange('addressLine2', e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
            placeholder="Area, Colony, Sector"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">City *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none transition-all ${
              errors.city ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500'
            }`}
            placeholder="Mumbai"
          />
          {errors.city && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <Info size={12} /> {errors.city}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">State *</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none transition-all ${
              errors.state ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500'
            }`}
            placeholder="Maharashtra"
          />
          {errors.state && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <Info size={12} /> {errors.state}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Postal Code *</label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className={`w-full p-4 bg-white/5 border rounded-xl focus:outline-none transition-all ${
              errors.postalCode ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500'
            }`}
            placeholder="400001"
            maxLength="6"
          />
          {errors.postalCode && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <Info size={12} /> {errors.postalCode}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Landmark</label>
          <input
            type="text"
            value={formData.landmark}
            onChange={(e) => handleInputChange('landmark', e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
            placeholder="Nearby landmark"
          />
        </div>
      </div>

      {/* Address Type */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300">Address Type</label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'home', label: 'Home', icon: Home, color: 'from-blue-500 to-cyan-500' },
            { value: 'office', label: 'Office', icon: Building, color: 'from-purple-500 to-pink-500' },
            { value: 'other', label: 'Other', icon: MapPin, color: 'from-green-500 to-emerald-500' }
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleInputChange('addressType', type.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.addressType === type.value
                  ? `border-cyan-500 bg-gradient-to-br ${type.color}/20`
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <type.icon size={20} className={
                  formData.addressType === type.value ? 'text-cyan-400' : 'text-slate-400'
                } />
                <span className="text-sm">{type.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save Address */}
      <div className="flex items-center gap-3 p-4 bg-slate-900/30 rounded-xl border border-white/10">
        <input
          type="checkbox"
          id="saveAddress"
          checked={formData.saveAddress}
          onChange={(e) => handleInputChange('saveAddress', e.target.checked)}
          className="rounded border-white/20 bg-white/5 checked:bg-cyan-500"
        />
        <label htmlFor="saveAddress" className="text-slate-300 cursor-pointer">
          Save this address for future orders
        </label>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
          <CreditCard className="text-green-400" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Payment Method</h2>
          <p className="text-slate-400">Choose how you'd like to pay</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { 
            id: 'credit_card', 
            label: 'Credit Card', 
            icon: CreditCard, 
            color: 'from-blue-500 to-cyan-500',
            popular: true
          },
          { 
            id: 'debit_card', 
            label: 'Debit Card', 
            icon: Card, 
            color: 'from-purple-500 to-pink-500'
          },
          { 
            id: 'upi', 
            label: 'UPI', 
            icon: Smartphone, 
            color: 'from-green-500 to-emerald-500',
            popular: true
          },
          { 
            id: 'net_banking', 
            label: 'Net Banking', 
            icon: Banknote, 
            color: 'from-yellow-500 to-orange-500'
          },
          { 
            id: 'wallet', 
            label: 'Wallet', 
            icon: Wallet, 
            color: 'from-red-500 to-pink-500'
          },
          { 
            id: 'cod', 
            label: 'Cash on Delivery', 
            icon: DeliveryTruck, 
            color: 'from-gray-600 to-gray-800'
          }
        ].map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => handleInputChange('paymentMethod', method.id)}
            className={`p-4 rounded-xl border-2 transition-all text-left relative ${
              formData.paymentMethod === method.id
                ? `border-cyan-500 bg-gradient-to-br ${method.color}/20`
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            {method.popular && (
              <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs rounded-full">
                Popular
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${method.color}`}>
                <method.icon size={20} className="text-white" />
              </div>
              <div>
                <div className="font-medium">{method.label}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {method.id === 'cod' ? 'Pay when delivered' : 'Secure payment'}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {errors.paymentMethod && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 flex items-center gap-2">
            <Info size={16} /> {errors.paymentMethod}
          </p>
        </div>
      )}

      {/* Card Details */}
      {(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6 p-6 bg-slate-900/30 rounded-2xl border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white">Card Details</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Card Number</label>
            <div className="relative">
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  value = value.replace(/(.{4})/g, '$1 ').trim();
                  handleInputChange('cardNumber', value);
                }}
                maxLength="19"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-all pr-12"
                placeholder="1234 5678 9012 3456"
              />
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <div className="text-xs text-slate-500">VISA</div>
                <div className="text-xs text-slate-500">MC</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Card Holder Name</label>
              <input
                type="text"
                value={formData.cardHolderName}
                onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Expiry</label>
                <input
                  type="text"
                  value={formData.cardExpiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    handleInputChange('cardExpiry', value);
                  }}
                  maxLength="5"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-all"
                  placeholder="MM/YY"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">CVC</label>
                <div className="relative">
                  <input
                    type={formData.showCardCVC ? "text" : "password"}
                    value={formData.cardCVC}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      handleInputChange('cardCVC', value);
                    }}
                    maxLength="4"
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-all pr-12"
                    placeholder="123"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('showCardCVC', !formData.showCardCVC)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white"
                  >
                    {formData.showCardCVC ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Lock size={14} />
            <span>Your payment information is encrypted and secure</span>
          </div>
        </motion.div>
      )}

      {/* Security Badge */}
      <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-400" size={20} />
          <div>
            <p className="text-green-400 font-medium">Secure Payment</p>
            <p className="text-green-500/70 text-sm">256-bit SSL encryption · PCI DSS compliant</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-8 py-8"
    >
      <motion.div
        animate={pulseAnimation.animate}
        className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mx-auto shadow-2xl shadow-green-500/30"
      >
        <Check size={48} className="text-white" />
      </motion.div>
      
      <div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Order Confirmed! 🎉
        </h2>
        <p className="text-slate-400 mt-4 max-w-lg mx-auto">
          Your order has been successfully placed. 
          You'll receive a confirmation email with tracking details shortly.
        </p>
      </div>
      
      <div className="bg-gradient-to-b from-slate-900/50 to-slate-900/30 rounded-2xl p-8 max-w-lg mx-auto border border-white/10 shadow-2xl">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Order Number:</span>
            <span className="font-mono text-xl font-bold text-cyan-400">
              {orderNumber || `ORD-${Date.now().toString().slice(-8)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-green-400 font-semibold flex items-center gap-2">
              <CheckCircle size={16} /> Processing
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Estimated Delivery:</span>
            <span className="text-white">3-5 business days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Method:</span>
            <span className="text-white capitalize">
              {formData.paymentMethod ? formData.paymentMethod.replace('_', ' ') : 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between text-lg pt-4 border-t border-white/10">
            <span className="font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-cyan-400">
              ₹{calculateOrderSummary().total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          Track Your Order
        </button>
        <button
          onClick={() => navigate('/products')}
          className="px-8 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl font-medium hover:bg-slate-800/70 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </motion.div>
  );

  const renderOrderSummary = () => {
    const summary = calculateOrderSummary();
    
    return (
      <motion.div
        variants={fadeInUp}
        className="bg-gradient-to-b from-slate-900/30 to-slate-900/10 rounded-2xl border border-white/10 p-6 sticky top-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="text-cyan-400" size={20} />
          Order Summary
        </h3>
        
        {product && (
          <div className="mb-6 p-4 bg-slate-900/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                <Package className="text-cyan-400" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{product.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-slate-400">{product.variant}</span>
                  <span className="font-bold">₹{(product.discountPrice || product.price).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span>₹{summary.subtotal.toLocaleString()}</span>
          </div>
          
          {/* Shipping Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Shipping</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Standard', price: 99, days: '5-7 days' },
                { id: 'express', label: 'Express', price: 199, days: '2-3 days' },
                { id: 'next_day', label: 'Next Day', price: 499, days: '24 hours' }
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleInputChange('shippingSpeed', option.id)}
                  className={`p-2 rounded-lg text-xs transition-all ${
                    formData.shippingSpeed === option.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-slate-800/50 hover:bg-slate-800/70'
                  }`}
                >
                  <div>{option.label}</div>
                  <div className="font-bold">₹{option.price}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Tax (18%)</span>
            <span>₹{summary.tax.toFixed(0)}</span>
          </div>

          {/* Gift Wrap */}
          <div className="flex items-center justify-between py-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-purple-400" />
              <span className="text-sm">Gift Wrap</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.giftWrap}
                onChange={(e) => handleInputChange('giftWrap', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </label>
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-2xl text-cyan-400">₹{summary.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <ShieldCheck size={14} className="text-green-400" />
              <span>Secure checkout · SSL encrypted</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050b16] to-[#0a1120] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-cyan-500 mx-auto" />
          <p className="mt-4 text-slate-300">Loading order form...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return renderStep4();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Complete Your Order
          </h1>
          <p className="text-slate-400 text-lg">Secure checkout with multiple payment options</p>
        </motion.div>

        {/* Progress Bar */}
        {renderStepIndicator()}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <motion.div 
              ref={formRef}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl"
            >
              <form onSubmit={(e) => e.preventDefault()}>
                <AnimatePresence mode="wait">
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={step === 1}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      step === 1 
                        ? 'opacity-0 cursor-default' 
                        : 'border border-white/20 hover:bg-white/5 hover:border-white/30'
                    }`}
                  >
                    Back
                  </button>
                  
                  <button
                    type="button"
                    onClick={step === 3 ? handleSubmitOrder : handleNextStep}
                    disabled={!isFormValid || submitting}
                    className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                      isFormValid && !submitting
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg hover:shadow-cyan-500/25 cursor-pointer'
                        : 'bg-slate-700 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : step === 3 ? (
                      <>
                        Complete Order
                        <Lock size={18} />
                      </>
                    ) : (
                      <>
                        Continue to {step === 1 ? 'Address' : 'Payment'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            {renderOrderSummary()}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: ShieldCheck, label: 'Secure Payment', color: 'text-green-400' },
            { icon: Truck, label: 'Free Shipping*', color: 'text-cyan-400' },
            { icon: Clock, label: '24/7 Support', color: 'text-purple-400' },
            { icon: CheckCircle, label: 'Easy Returns', color: 'text-yellow-400' }
          ].map((badge) => (
            <div
              key={badge.label}
              className="p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <badge.icon className={`h-6 w-6 mx-auto mb-2 ${badge.color}`} />
              <p className="text-sm text-slate-300">{badge.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;