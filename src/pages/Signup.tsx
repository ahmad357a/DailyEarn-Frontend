import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Gift, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check for referral code in URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      validateReferralCode(refCode);
    }
  }, [location]);

  const validateReferralCode = async (code: string) => {
    if (!code) return;
    
    setIsValidatingCode(true);
    try {
      const response = await api.get(`/api/referrals/validate/${code}`);
      if (response.data.valid) {
        setReferrerName(response.data.referrerName);
        toast({
          title: 'Valid referral code!',
          description: `You'll be referred by ${response.data.referrerName}`,
        });
      } else {
        setReferralCode('');
        setReferrerName('');
        toast({
          title: 'Invalid referral code',
          description: 'The referral code is not valid.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/register', {
        username: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        email: formData.email,
        referralCode: referralCode || undefined
      });
      setIsLoading(false);
      toast({
        title: 'Account created!',
        description: response.data.message || 'Please check your email to verify your account.',
      });
      
      // Navigate based on whether user was auto-verified
      if (response.data.autoVerified) {
        navigate('/login');
      } else {
        navigate('/verify-email');
      }
    } catch (error: unknown) {
      setIsLoading(false);
      let errorMsg = 'Signup failed. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        errorMsg = error.response.data?.error || errorMsg;
      }
      toast({
        title: 'Signup failed',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  const benefits = [
    "Enter daily lucky draws",
    "Win amazing prizes",
    "Secure and transparent",
    "Instant notifications"
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-secondary/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-primary/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-large border-white/20 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-gradient-primary p-3 rounded-2xl w-fit">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Join DailyEarn</CardTitle>
              <CardDescription className="text-muted-foreground">
                Start winning amazing prizes today!
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {/* Benefits */}
            <div className="bg-primary/5 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3">What you'll get:</h3>
              <div className="grid grid-cols-2 gap-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              {/* Referral Code Section */}
              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code or User ID (Optional)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    placeholder="Enter referral code or user ID"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value);
                      if (e.target.value) {
                        validateReferralCode(e.target.value);
                      } else {
                        setReferrerName('');
                      }
                    }}
                    className="h-12 flex-1"
                    disabled={isValidatingCode}
                  />
                  {isValidatingCode && (
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-md">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                {referrerName && (
                  <div className="text-sm text-green-600 space-y-1">
                    <p>✓ Valid referral code! You'll be referred by {referrerName}</p>
                  </div>
                )}
                {referralCode && !referrerName && !isValidatingCode && (
                  <p className="text-sm text-red-600">
                    ✗ Invalid referral code
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;