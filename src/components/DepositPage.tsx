"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { Copy, CheckCircle, AlertCircle, CreditCard, Upload, X } from "lucide-react"
import { depositService, type Deposit } from "@/services/depositService"
import { useToast } from "@/hooks/use-toast"

export function DepositPage() {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [transactionHash, setTransactionHash] = useState("")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(false)

  const binanceAddress = "1048420929"
  const minDeposit = 10

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(binanceAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Load user deposits on component mount and refresh user data
  useEffect(() => {
    loadDeposits()
    // Refresh user data to get updated balance and deposit status
    if (refreshUser) {
      refreshUser()
    }
  }, [refreshUser])

  const loadDeposits = async () => {
    try {
      setIsLoadingDeposits(true)
      const response = await depositService.getDeposits()
      if (response.success && response.deposits) {
        setDeposits(response.deposits)
      }
    } catch (error) {
      console.error('Failed to load deposits:', error)
    } finally {
      setIsLoadingDeposits(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive"
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive"
        })
        return
      }

      setUploadedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImagePreview(null)
  }

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('receipt', file) // Changed from 'file' to 'receipt'
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://easyearn-backend-production-01ac.up.railway.app'}/api/upload-deposit-receipt`, { // Using dedicated endpoint
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload receipt')
      }
      
      const data = await response.json()
      console.log('Deposit receipt uploaded to Cloudinary:', data.url)
      return data.url
    } catch (error: any) {
      console.error('Receipt upload error:', error)
      throw new Error(error.message || 'Failed to upload receipt to Cloudinary')
    }
  }

  const handleDeposit = async () => {
    if (Number.parseFloat(amount) < minDeposit) {
      toast({
        title: "Error",
        description: `Minimum deposit is $${minDeposit}`,
        variant: "destructive"
      })
      return
    }

    if (!uploadedImage) {
      toast({
        title: "Error",
        description: "Please upload a receipt screenshot",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    setIsUploading(true)

    try {
      // Upload image
      let finalReceiptUrl: string
      try {
        finalReceiptUrl = await uploadImageToServer(uploadedImage)
        toast({
          title: "Success",
          description: "Receipt image uploaded successfully!"
        })
      } catch (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive"
        })
        setIsUploading(false)
        setIsProcessing(false)
        return
      }

      const depositData = {
        amount: Number.parseFloat(amount),
        receiptUrl: finalReceiptUrl,
        transactionHash: transactionHash.trim() || undefined,
        notes: `Deposit via Binance address: ${binanceAddress}`
      }

      const response = await depositService.createDeposit(depositData)

      if (response.success) {
        toast({
          title: "Success",
          description: "Deposit request submitted successfully! It will be reviewed and confirmed shortly."
        })
        setAmount("")
        setTransactionHash("")
        setUploadedImage(null)
        setImagePreview(null)
        await loadDeposits() // Refresh deposit list
        if (refreshUser) {
          await refreshUser() // Refresh user data
        }
      } else {
        toast({
          title: "Error",
          description: response.error || 'Failed to submit deposit request',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Deposit error:', error)
      toast({
        title: "Error",
        description: "Failed to submit deposit request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Deposit Funds</h1>
        <p className="text-gray-600 mt-2">Add funds to your account using Binance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Make a Deposit
            </CardTitle>
            <CardDescription>Only Binance transfers accepted | Contact: easyeanses@gmail.com</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Deposit Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={minDeposit}
                step="0.01"
              />
              <p className="text-sm text-gray-600">
                Current Balance: ${user?.balance || 0} | Tasks Unlocked: {user?.hasDeposited ? 'Yes' : 'No'}
                {!user?.hasDeposited && (
                  <span className="block text-orange-600 font-medium mt-1">
                    ⚠️ First $10 deposit unlocks tasks but doesn't add to balance
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Binance Wallet Address</Label>
              <div className="flex items-center space-x-2">
                <Input value={binanceAddress} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="flex-shrink-0 bg-transparent"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {copied && <p className="text-sm text-green-600">Address copied to clipboard!</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptImage">Receipt Screenshot (Required) *</Label>
              
              {/* Image Upload Area */}
              <div className="space-y-4">
                {/* Upload Button */}
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="receiptImage"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                    <input
                      id="receiptImage"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Receipt preview"
                      className="w-full max-w-md mx-auto rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionHash">Transaction Hash (Optional)</Label>
              <Input
                id="transactionHash"
                type="text"
                placeholder="TRC20 transaction hash"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
              />
              <p className="text-sm text-gray-600">
                If you have the transaction hash, include it for faster processing
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Only send USDT (TRC-20) to this address</li>
                    <li><strong>First $10 deposit unlocks tasks but doesn't add to balance</strong></li>
                    <li>Subsequent deposits add to your balance normally</li>
                    <li>Deposits are processed within 10-30 minutes</li>
                    <li>Double-check the address before sending</li>
                    <li>Contact support: easyeanses@gmail.com</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDeposit}
              disabled={!amount || Number.parseFloat(amount) < minDeposit || !uploadedImage || isProcessing}
              className="w-full"
            >
              {isProcessing ? (isUploading ? "Uploading Image..." : "Processing Deposit...") : "Submit Deposit Request"}
            </Button>
          </CardContent>
        </Card>

        {/* Deposit Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Deposit?</CardTitle>
            <CardDescription>Unlock premium features and earning opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Unlock Task Earning</h4>
                  <p className="text-sm text-gray-600">First $10 deposit unlocks tasks (doesn't add to balance)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Higher Withdrawal Limits</h4>
                  <p className="text-sm text-gray-600">Increase your daily and monthly withdrawal limits</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Premium Support</h4>
                  <p className="text-sm text-gray-600">Get priority customer support and faster response times</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium">Bonus Opportunities</h4>
                  <p className="text-sm text-gray-600">Access exclusive bonuses and promotional offers</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-900 mb-2">Current Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Tasks Unlocked:</span>
                  <Badge variant={user?.hasDeposited ? "default" : "secondary"}>
                    {user?.hasDeposited ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Account Balance:</span>
                  <span className="text-sm font-medium text-blue-900">${((user?.balance || 0) + (user?.additionalBalance || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deposits */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Deposits</CardTitle>
              <CardDescription>Your deposit history</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadDeposits()
                if (refreshUser) refreshUser()
              }}
              className="ml-2"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingDeposits ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Loading deposits...</span>
            </div>
          ) : deposits.length > 0 ? (
            <div className="space-y-4">
              {deposits.map((deposit) => (
                <div key={deposit._id} className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">USDT Deposit</p>
                    <p className="text-sm text-gray-600">
                      {new Date(deposit.createdAt).toLocaleDateString()} • {deposit.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+${deposit.amount.toFixed(2)}</p>
                    <Badge 
                      variant={deposit.status === 'confirmed' ? 'default' : deposit.status === 'pending' ? 'secondary' : 'destructive'} 
                      className="text-xs"
                    >
                      {deposit.status === 'confirmed' ? 'Confirmed' : deposit.status === 'pending' ? 'Pending' : 'Rejected'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deposits yet. Make your first deposit to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 