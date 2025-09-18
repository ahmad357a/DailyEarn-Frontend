import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import NotificationCenter from '@/components/NotificationCenter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bell,
  Gift,
  Clock,
  Users,
  Trophy,
  Upload,
  Wallet,
  X,
  CheckCircle,
  ClipboardCopy,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import giftBox from '@/assets/gift-box.jpg';
import phonePrize from '@/assets/phone-prize.jpg';
import axios from 'axios';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const [selectedPrize, setSelectedPrize] = useState<any>(null);
  const [binanceUID, setBinanceUID] = useState<string>('1048420929');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [entryUploadUrl, setEntryUploadUrl] = useState<string | null>(null);
  const [isUploadingEntry, setIsUploadingEntry] = useState(false);
  const [participationStatus, setParticipationStatus] = useState<{ [prizeId: string]: 'none' | 'waiting' | 'submitted' | 'again' }>({});
  const [notifications, setNotifications] = useState<{ id?: number; title: string; message: string; createdAt: string; read?: boolean; type?: string }[]>([]);
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Example Binance UID
  const exampleBinanceUID = '1048420929';

  const [prizes, setPrizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://easyearn-backend-production-01ac.up.railway.app'}/api/my-participations`, { withCredentials: true });
      const participations = response.data.participations || [];
      const newStatus: { [prizeId: string]: 'none' | 'waiting' | 'submitted' | 'again' } = {};
      
      // Handle both old prize-based participations and new lucky draw participations
      participations.forEach((p: any) => {
        const participationId = p.luckyDrawId || p.prizeId;
        if (p.submittedButton === true) {
          newStatus[participationId] = 'submitted';
        } else if (p.submittedButton === false) {
          newStatus[participationId] = 'again';
        } else if (p.submittedButton === null) {
          // Pending approval
          newStatus[participationId] = 'waiting';
        } else {
          newStatus[participationId] = 'none';
        }
      });
      setParticipationStatus(newStatus);
    } catch (err) {
      console.error('Failed to fetch participations:', err);
      // Don't show error toast for this as it's not critical
    }
  };

  const fetchLuckyDraws = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://easyearn-backend-production-01ac.up.railway.app'}/api/lucky-draws`);
      const luckyDraws = response.data.luckyDraws || [];
      
      // Transform lucky draws to match the frontend format
      const transformedPrizes = luckyDraws.map((draw: any) => {
        const now = new Date();
        const endDate = new Date(draw.endDate);
        const timeLeft = Math.max(0, endDate.getTime() - now.getTime());
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
          id: draw._id,
          title: draw.title,
          price: `$${draw.entryFee}`,
          image: draw.prize.toLowerCase().includes('iphone') ? phonePrize : giftBox,
          participants: draw.currentParticipants,
          maxParticipants: draw.maxParticipants,
          timeLeft: `${hours}h ${minutes}m`,
          description: draw.description,
          features: [
            `Max ${draw.maxParticipants} participants`,
            `Entry fee: $${draw.entryFee}`,
            `Prize: ${draw.prize}`,
            'Fair random selection'
          ],
          gradient: draw.prize.toLowerCase().includes('iphone') ? 'from-accent to-accent/80' : 'from-primary to-primary-light',
          status: draw.status,
          startDate: draw.startDate,
          endDate: draw.endDate
        };
      });
      
      setPrizes(transformedPrizes);
    } catch (err) {
      console.error('Failed to fetch lucky draws:', err);
      // Fallback to empty array
      setPrizes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch lucky draws on component mount
    fetchLuckyDraws();
    
    if (user) {
      fetchParticipations();
    }
    
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://easyearn-backend-production-01ac.up.railway.app'}/api/user/notifications`, { withCredentials: true });
        const notificationsData = response.data.notifications || [];
        // Add id and read status to notifications
        const enrichedNotifications = notificationsData.map((n: any, index: number) => ({
          id: n._id || index + 1,
          title: n.title,
          message: n.message,
          createdAt: n.createdAt,
          read: n.read || false,
          type: n.type || 'info'
        }));
        setNotifications(enrichedNotifications);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        // Keep empty array if no notifications
        setNotifications([]);
      }
    };
    fetchNotifications();
    
    // POLLING: Refetch data every 30 seconds
    const interval = setInterval(() => {
      fetchLuckyDraws();
      if (user) {
        fetchParticipations();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleParticipate = (prize: any) => {
    setSelectedPrize(prize);
  };

  // Handle file upload for Participate Now using dedicated Cloudinary endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
      setIsUploadingEntry(true);
      const formData = new FormData();
      formData.append('entry', e.target.files[0]); // Changed from 'file' to 'entry'
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'https://easyearn-backend-production-01ac.up.railway.app'}/api/upload-homepage-entry`, // Using dedicated endpoint
          formData,
          { 
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true // Added authentication
          }
        );
        setEntryUploadUrl(response.data.url);
        console.log('Homepage entry uploaded to Cloudinary:', response.data.url);
        toast({ title: 'Entry uploaded!', description: 'File uploaded successfully to Cloudinary.' });
      } catch (error: any) {
        console.error('Homepage entry upload error:', error);
        const errorMessage = error.response?.data?.error || 'Could not upload file. Please try again.';
        toast({ title: 'Upload failed', description: errorMessage, variant: 'destructive' });
        setEntryUploadUrl(null);
      } finally {
        setIsUploadingEntry(false);
      }
    }
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Use the new lucky draw participation endpoint with receipt image
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://easyearn-backend-production-01ac.up.railway.app'}/api/lucky-draws/${selectedPrize?.id}/participate`,
        {
          walletAddress: binanceUID, // Using binanceUID as wallet address for now
          receiptUrl: entryUploadUrl // Include the uploaded receipt image URL
        },
        { withCredentials: true }
      );
      // After submit, re-fetch participations to update status
      await fetchParticipations();
      toast({
        title: 'Entry submitted!',
        description: `You're now entered in the ${selectedPrize?.title} draw. Good luck!`,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to save participation.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setSelectedPrize(null);
      setBinanceUID(exampleBinanceUID);
      setReceipt(null);
      setEntryUploadUrl(null);
    }
  };

  // Copy Binance UID to clipboard
  const handleCopyBinanceUID = () => {
    navigator.clipboard.writeText(binanceUID);
    toast({ title: 'Copied!', description: 'Binance UID copied to clipboard.' });
  };

  // Notification handlers
  const handleMarkAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Navbar */}
      <Navbar />

      {/* Lucky Draw Notification */}
      <div className="container mx-auto px-4 py-8">
        {showNotification && (
          <Card className="mb-8 winner-glow animate-bounce-in">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-full">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-700">Welcome to Daily Earn!</h3>
                    <p className="text-muted-foreground">
                      You're now entered into our{' '}
                      <span className="font-semibold text-foreground">Daily Lucky Draw</span>{' '}
                      automatically. Earn more entries by inviting friends and completing simple
                      tasks!
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className="bg-yellow-100 text-yellow-700">Daily Prize Pool: $50</Badge>
                      <Badge className="bg-green-100 text-green-700">Entry Confirmed</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowNotification(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prize Cards */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-foreground">Available Prizes</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLuckyDraws}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Card key={i} className="lucky-card group overflow-hidden">
                  <div className="relative h-64 mb-6 bg-gray-200 animate-pulse"></div>
                  <CardHeader className="pb-4">
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : prizes.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Active Lucky Draws</h3>
              <p className="text-muted-foreground">Check back later for new exciting prizes!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {prizes.map((prize) => (
              <Card key={prize.id} className="lucky-card group overflow-hidden">
                <div className="relative h-64 mb-6">
                  <img
                    src={prize.image}
                    alt={prize.title}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${prize.gradient} opacity-20 rounded-xl`}
                  ></div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {prize.timeLeft}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{prize.title}</CardTitle>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{prize.price}</div>
                      <div className="text-sm text-muted-foreground">per entry</div>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {prize.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {prize.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      {prize.participants.toLocaleString()} entries
                    </div>
                    <div className="text-primary font-medium">
                      Odds: 1 in {prize.participants}
                    </div>
                  </div>

                  <Dialog
                    open={selectedPrize !== null}
                    onOpenChange={(open) => {
                      if (!open) {
                        setSelectedPrize(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className={`w-full btn-primary text-lg ${participationStatus[prize.id] === 'submitted' || participationStatus[prize.id] === 'waiting' ? 'bg-green-500 hover:bg-green-600' : participationStatus[prize.id] === 'again' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                        onClick={() => handleParticipate(prize)}
                        disabled={participationStatus[prize.id] === 'submitted' || participationStatus[prize.id] === 'waiting'}
                      >
                        {participationStatus[prize.id] === 'waiting'
                          ? 'Waiting For Approval'
                          : participationStatus[prize.id] === 'submitted'
                          ? 'Submitted'
                          : participationStatus[prize.id] === 'again'
                          ? 'Participate Again'
                          : 'Participate Now'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <Gift className="h-5 w-5 text-primary" />
                          <span>Enter Draw</span>
                        </DialogTitle>
                        <DialogDescription>
                          Complete your entry for {selectedPrize?.title}
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmitEntry} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="binanceUID">Binance UID</Label>
                          <div className="relative">
                            <Input
                              id="binanceUID"
                              placeholder="Enter your Binance UID"
                              value={binanceUID}
                              readOnly
                              className="h-12 pr-12"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                              onClick={handleCopyBinanceUID}
                            >
                              <ClipboardCopy className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            This is your Binance UID for prize payout.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="receipt">Payment Receipt</Label>
                          <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              id="receipt"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={isUploadingEntry}
                            />
                            <Label htmlFor="receipt" className="cursor-pointer">
                              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                {receipt ? receipt.name : 'Click to upload receipt'}
                              </p>
                            </Label>
                            {isUploadingEntry && <div className="text-xs text-muted-foreground">Uploading...</div>}
                            {entryUploadUrl && (
                              <div className="mt-2">
                                <a href={entryUploadUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Uploaded Receipt</a>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Upload proof of payment ({selectedPrize?.price})
                          </p>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="font-semibold text-foreground mb-2">Entry Summary</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Prize:</span>
                              <span className="font-medium">{selectedPrize?.title}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Entry Cost:</span>
                              <span className="font-medium">{selectedPrize?.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Current Entries:</span>
                              <span className="font-medium">{selectedPrize?.participants}</span>
                            </div>
                          </div>
                        </div>

                        <Button type="submit" className={`w-full btn-primary ${participationStatus[selectedPrize?.id] === 'submitted' || participationStatus[selectedPrize?.id] === 'waiting' ? 'bg-green-500 hover:bg-green-600' : participationStatus[selectedPrize?.id] === 'again' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`} disabled={isSubmitting || participationStatus[selectedPrize?.id] === 'submitted' || participationStatus[selectedPrize?.id] === 'waiting'}>
                          {participationStatus[selectedPrize?.id] === 'waiting'
                            ? 'Waiting For Approval'
                            : participationStatus[selectedPrize?.id] === 'submitted'
                            ? 'Submitted'
                            : participationStatus[selectedPrize?.id] === 'again'
                            ? 'Participate Again'
                            : isSubmitting
                            ? 'Submitting...'
                            : 'Submit Entry'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
