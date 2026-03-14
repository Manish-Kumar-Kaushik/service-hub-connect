import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, Store, Phone, MapPin, Camera, CreditCard, Mail, Lock, CheckCircle2, Upload, FileText, Plus, Trash2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { serviceCategories } from "@/components/sidebar/SidebarData";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const HOME_ONLY_CATEGORIES = ["Home Services", "Vehicle Services", "Health & Home Care"];

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Business Details", icon: Store },
  { label: "Documents", icon: FileText },
  { label: "Bank Details", icon: CreditCard },
  { label: "Account Setup", icon: Lock },
];

interface ServicePriceRow {
  id: string;
  serviceName: string;
  price: string;
}

const ProviderRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    shopName: "",
    shopAddress: "",
    category: "",
    services: [] as string[],
    serviceType: "" as "" | "home_visit" | "appointment" | "both",
    aadhaarNumber: "",
    bankAccount: "",
    upiId: "",
    password: "",
    confirmPassword: "",
  });

  const [servicePrices, setServicePrices] = useState<ServicePriceRow[]>([]);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [servicesLocked, setServicesLocked] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAadhaarFile(file);
      setAadhaarPreview(URL.createObjectURL(file));
    }
  };

  const handleCategorySelect = (catTitle: string) => {
    const isHomeOnly = HOME_ONLY_CATEGORIES.includes(catTitle);
    setForm({
      ...form,
      category: catTitle,
      services: [],
      serviceType: isHomeOnly ? "home_visit" : "",
    });
    setCategoryLocked(true);
    setServicesLocked(false);
    setServicePrices([]);
  };

  const handleCategoryReset = () => {
    setForm({ ...form, category: "", services: [], serviceType: "" });
    setCategoryLocked(false);
    setServicesLocked(false);
    setServicePrices([]);
  };

  const handleServiceToggle = (service: string) => {
    if (servicesLocked) return;
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleServicesConfirm = () => {
    if (form.services.length === 0) {
      toast({ title: "Required", description: "Kam se kam ek service select karo.", variant: "destructive" });
      return;
    }
    setServicesLocked(true);
    // Initialize pricing table with selected services
    setServicePrices(
      form.services.map((s) => ({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        serviceName: s,
        price: "",
      }))
    );
  };

  const handleServicesReset = () => {
    setServicesLocked(false);
    setServicePrices([]);
  };

  const addPriceRow = () => {
    setServicePrices((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, serviceName: "", price: "" },
    ]);
  };

  const removePriceRow = (id: string) => {
    setServicePrices((prev) => prev.filter((r) => r.id !== id));
  };

  const updatePriceRow = (id: string, field: "serviceName" | "price", value: string) => {
    setServicePrices((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const selectedCategory = serviceCategories.find((c) => c.title === form.category);
  const isHomeOnlyCategory = HOME_ONLY_CATEGORIES.includes(form.category);

  const phoneRegex = /^\d{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[a-zA-Z\s]+$/;
  const aadhaarRegex = /^\d{12}$/;
  const upiRegex = /^[\w.\-]+@[\w]+$/;
  const bankAccountRegex = /^\d{9,18}$/;

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.email.trim()) {
          toast({ title: "Required", description: "Sabhi fields fill karo - Name, Last Name, Phone, Email.", variant: "destructive" });
          return false;
        }
        if (!nameRegex.test(form.firstName.trim())) {
          toast({ title: "Invalid", description: "First Name mein sirf letters allowed hain.", variant: "destructive" });
          return false;
        }
        if (!nameRegex.test(form.lastName.trim())) {
          toast({ title: "Invalid", description: "Last Name mein sirf letters allowed hain.", variant: "destructive" });
          return false;
        }
        if (!phoneRegex.test(form.phone.trim())) {
          toast({ title: "Invalid", description: "Phone number exactly 10 digits ka hona chahiye.", variant: "destructive" });
          return false;
        }
        if (!emailRegex.test(form.email.trim())) {
          toast({ title: "Invalid", description: "Valid email address daalo.", variant: "destructive" });
          return false;
        }
        return true;
      case 1:
        if (!form.shopName.trim() || !form.shopAddress.trim()) {
          toast({ title: "Required", description: "Shop Name aur Shop Address daalna zaroori hai.", variant: "destructive" });
          return false;
        }
        if (!form.category || form.services.length === 0) {
          toast({ title: "Required", description: "Category aur Services select karo.", variant: "destructive" });
          return false;
        }
        if (!isHomeOnlyCategory && !form.serviceType) {
          toast({ title: "Required", description: "Service Type select karo.", variant: "destructive" });
          return false;
        }
        if (servicePrices.some((r) => !r.serviceName.trim() || !r.price.trim())) {
          toast({ title: "Required", description: "Pricing table mein sabhi service name aur price daalo.", variant: "destructive" });
          return false;
        }
        if (servicePrices.some((r) => Number(r.price) <= 0)) {
          toast({ title: "Invalid", description: "Price 0 se zyada hona chahiye.", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (form.aadhaarNumber.trim() && !aadhaarRegex.test(form.aadhaarNumber.replace(/\s/g, ""))) {
          toast({ title: "Invalid", description: "Aadhaar number 12 digits ka hona chahiye.", variant: "destructive" });
          return false;
        }
        return true;
      case 3:
        if (form.bankAccount.trim() && !bankAccountRegex.test(form.bankAccount.trim())) {
          toast({ title: "Invalid", description: "Bank account number 9-18 digits ka hona chahiye.", variant: "destructive" });
          return false;
        }
        if (form.upiId.trim() && !upiRegex.test(form.upiId.trim())) {
          toast({ title: "Invalid", description: "Valid UPI ID daalo (e.g. name@upi).", variant: "destructive" });
          return false;
        }
        return true;
      case 4:
        if (!form.password || !form.confirmPassword) {
          toast({ title: "Required", description: "Password aur Confirm Password daalo.", variant: "destructive" });
          return false;
        }
        if (form.password !== form.confirmPassword) {
          toast({ title: "Error", description: "Password match nahi ho raha.", variant: "destructive" });
          return false;
        }
        if (form.password.length < 6) {
          toast({ title: "Error", description: "Password kam se kam 6 characters ka hona chahiye.", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("provider-photos").upload(fileName, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("provider-photos").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);

    try {
      let avatarUrl: string | null = null;
      let aadhaarPhotoUrl: string | null = null;

      if (photoFile) {
        avatarUrl = await uploadFile(photoFile, "avatars");
      }
      if (aadhaarFile) {
        aadhaarPhotoUrl = await uploadFile(aadhaarFile, "aadhaar");
      }

      const userId = `provider_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const fullName = `${form.firstName} ${form.lastName}`.trim();

      const { error } = await supabase.from("service_providers").insert({
        user_id: userId,
        name: fullName,
        phone: form.phone,
        email: form.email,
        address: form.shopAddress,
        shop_name: form.shopName || null,
        category: form.category,
        services_offered: form.services,
        experience_years: 0,
        aadhaar_number: form.aadhaarNumber || null,
        bank_account_number: form.bankAccount || null,
        upi_id: form.upiId || null,
        avatar_url: avatarUrl || aadhaarPhotoUrl,
        password_hash: form.password,
        is_active: false,
        is_verified: false,
        verification_status: "pending",
      });

      if (error) throw error;

      setSuccess(true);
      toast({ title: "✅ Registration Successful!", description: "Aapka account verification ke liye submit ho gaya hai." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 px-4 max-w-lg mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Registration Complete!</h2>
          <div className="bg-muted rounded-2xl p-6 text-left space-y-3">
            <p className="text-sm text-muted-foreground">✅ Aapka profile successfully submit ho gaya hai.</p>
            <p className="text-sm text-muted-foreground">🔍 Humari team aapke documents aur details verify karegi.</p>
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              ⏳ Account verification under <span className="text-primary">2-3 working days</span> mein complete ho jayega.
            </p>
            <p className="text-sm text-muted-foreground">📩 Verification hone par aapko notification mil jayega.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/provider-signup")}>Login Page</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground" onClick={() => navigate("/provider-signup")}>
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Button>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Service Provider Registration</h1>
          <p className="text-muted-foreground mb-8">Apna account create karo aur services dena shuru karo</p>

          {/* Stepper */}
          <div className="mb-8">
            <ol className="flex items-center w-full text-sm font-medium text-muted-foreground">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                const StepIcon = step.icon;
                return (
                  <li key={index} className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""} ${isCompleted || isActive ? "text-primary" : "text-muted-foreground"}`}>
                    <div className="flex flex-col items-center w-full">
                      <div className="flex items-center w-full">
                        <span className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full shrink-0 transition-all ${isCompleted ? "bg-primary text-primary-foreground" : isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <StepIcon className="w-4 h-4 md:w-5 md:h-5" />}
                        </span>
                        {index < STEPS.length - 1 && (
                          <div className={`w-full h-1 mx-1 md:mx-2 rounded-full transition-all ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                        )}
                      </div>
                      <span className="text-[10px] md:text-xs mt-1.5 text-center leading-tight hidden sm:block">{step.label}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Step Content */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-8 shadow-card min-h-[320px]">

            {/* Step 0: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">First Name *</label>
                    <Input placeholder="Aapka first name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Last Name *</label>
                    <Input placeholder="Aapka last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Phone Number *</label>
                    <div className="flex">
                      <span className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-sm text-muted-foreground">+91</span>
                      <Input className="rounded-l-none" placeholder="XXXXX XXXXX" value={form.phone} maxLength={10} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setForm({ ...form, phone: v }); }} />
                    </div>
                    {form.phone && !phoneRegex.test(form.phone) && (
                      <p className="text-xs text-destructive mt-1">Phone number 10 digits ka hona chahiye</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input className="pl-10" placeholder="aapka@email.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()} className="gap-2">
                        <Upload className="w-3.5 h-3.5" /> Upload Photo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">Apni photo upload karo</p>
                    </div>
                  </div>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>
              </div>
            )}

            {/* Step 1: Business Details */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" /> Business Details
                </h2>

                {/* Shop Name & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Shop Name *</label>
                    <Input placeholder="Aapki shop ka naam" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Shop Address *</label>
                    <Input placeholder="Full shop address" value={form.shopAddress} onChange={(e) => setForm({ ...form, shopAddress: e.target.value })} />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Service Category *</label>
                    {categoryLocked && (
                      <Button variant="ghost" size="sm" className="text-xs text-destructive h-6 px-2" onClick={handleCategoryReset}>
                        Change Category
                      </Button>
                    )}
                  </div>
                  {!categoryLocked ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {serviceCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.title}
                            onClick={() => handleCategorySelect(cat.title)}
                            className="border border-border rounded-xl p-3 text-left transition-all flex items-center gap-2 hover:border-primary/40 hover:bg-primary/5"
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">{cat.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-primary bg-primary/10 rounded-xl p-3 flex items-center gap-2 w-fit">
                      {selectedCategory && (() => { const Icon = selectedCategory.icon; return <Icon className="w-4 h-4 text-primary" />; })()}
                      <span className="text-sm font-semibold text-primary">{form.category}</span>
                    </div>
                  )}
                </div>

                {/* Sub-categories / Services Selection */}
                {categoryLocked && selectedCategory && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Services You Offer *</label>
                      {servicesLocked && (
                        <Button variant="ghost" size="sm" className="text-xs text-destructive h-6 px-2" onClick={handleServicesReset}>
                          Change Services
                        </Button>
                      )}
                    </div>
                    {!servicesLocked ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {selectedCategory.items.map((item) => {
                            const Icon = item.icon;
                            const selected = form.services.includes(item.label);
                            return (
                              <button
                                key={item.label}
                                onClick={() => handleServiceToggle(item.label)}
                                className={`border rounded-lg p-2.5 text-left transition-all flex items-center gap-2 text-sm ${
                                  selected
                                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                                    : "border-border hover:border-primary/40 hover:bg-primary/5"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                        {form.services.length > 0 && (
                          <Button size="sm" onClick={handleServicesConfirm} className="gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Services ({form.services.length})
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {form.services.map((s) => {
                          const item = selectedCategory.items.find((i) => i.label === s);
                          const Icon = item?.icon;
                          return (
                            <div key={s} className="border border-primary bg-primary/10 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-sm text-primary font-medium">
                              {Icon && <Icon className="w-3.5 h-3.5" />}
                              {s}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Service Type */}
                {servicesLocked && (
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Service Type *</label>
                    {isHomeOnlyCategory ? (
                      <div className="border border-primary bg-primary/10 rounded-xl p-3 flex items-center gap-2 w-fit">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Home Visit (Auto Selected)</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setForm({ ...form, serviceType: "home_visit" })}
                          className={`border rounded-xl p-3 text-center transition-all text-sm font-medium ${
                            form.serviceType === "home_visit"
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          🏠 Home Visit
                        </button>
                        <button
                          onClick={() => setForm({ ...form, serviceType: "both" })}
                          className={`border rounded-xl p-3 text-center transition-all text-sm font-medium ${
                            form.serviceType === "both"
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          🏠 Home Visit + 📅 Appointment
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Table */}
                {servicesLocked && (form.serviceType || isHomeOnlyCategory) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4 text-primary" /> Service Pricing *
                      </label>
                      <Button variant="outline" size="sm" onClick={addPriceRow} className="gap-1.5 h-7 text-xs">
                        <Plus className="w-3 h-3" /> Add Row
                      </Button>
                    </div>
                    <div className="border border-border rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs font-semibold">Service Name</TableHead>
                            <TableHead className="text-xs font-semibold w-32">Price (₹)</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {servicePrices.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="p-2">
                                <Input
                                  className="h-8 text-sm"
                                  placeholder="Service name"
                                  value={row.serviceName}
                                  onChange={(e) => updatePriceRow(row.id, "serviceName", e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="p-2">
                                <Input
                                  className="h-8 text-sm"
                                  type="number"
                                  min="1"
                                  placeholder="₹ 0"
                                  value={row.price}
                                  onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
                                  onChange={(e) => { const v = e.target.value; if (Number(v) >= 0 || v === "") updatePriceRow(row.id, "price", v); }}
                                />
                              </TableCell>
                              <TableCell className="p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() => removePriceRow(row.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {servicePrices.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">
                                Services confirm karo, pricing rows automatically add ho jayengi
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">Add Row se naye services add karo, delete icon se hatao</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Documents */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Documents & ID Verification
                </h2>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Aadhaar Card Number</label>
                  <Input placeholder="XXXX XXXX XXXX" maxLength={14} value={form.aadhaarNumber} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 12); setForm({ ...form, aadhaarNumber: v }); }} />
                  {form.aadhaarNumber && form.aadhaarNumber.length > 0 && form.aadhaarNumber.length < 12 && (
                    <p className="text-xs text-destructive mt-1">Aadhaar number 12 digits ka hona chahiye</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Aadhaar Card Photo</label>
                  <div
                    onClick={() => aadhaarInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {aadhaarPreview ? (
                      <img src={aadhaarPreview} alt="Aadhaar" className="max-h-40 mx-auto rounded-lg" />
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">Click karke Aadhaar card photo upload karo</p>
                        <p className="text-xs text-muted-foreground">Front ya back koi bhi side</p>
                      </div>
                    )}
                  </div>
                  <input ref={aadhaarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAadhaarChange} />
                </div>
              </div>
            )}

            {/* Step 3: Bank Details */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Bank & Payment Details
                </h2>
                <p className="text-sm text-muted-foreground">Ye details isliye chahiye taki service ke baad aapko payment mil sake.</p>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Bank Account Number</label>
                  <Input placeholder="Account number daalo" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">UPI ID</label>
                  <Input placeholder="example@upi" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} />
                </div>
              </div>
            )}

            {/* Step 4: Account Setup */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" /> Account Setup
                </h2>
                <p className="text-sm text-muted-foreground">Email: <span className="font-medium text-foreground">{form.email}</span></p>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Create Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="Kam se kam 6 characters" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="Password dobara likho" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">Password match nahi ho raha</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Previous
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={nextStep} className="gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                {loading ? "Submitting..." : "Confirm Registration"} <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister;
