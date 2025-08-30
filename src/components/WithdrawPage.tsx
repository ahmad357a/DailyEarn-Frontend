"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Banknote, AlertCircle, CheckCircle, X, Loader2 } from "lucide-react"
import axios from "axios"

interface WithdrawalRequirement {
  periodStart: string
  periodEnd: string
  requirements: {
    referrals: { required: number; completed: number; met: boolean }
    deposit: { required: number; completed: number; met: boolean }
    luckyDraw: { required: number; completed: number; met: boolean }
  }
  allRequirementsMet: boolean
  balanceReset: boolean
  daysLeft: number
}

interface Withdrawal {
  id: string
  amount: number
  walletAddress: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  createdAt: string
  processedAt?: string
  notes?: string
}

export function WithdrawPage() {
  const { user } = useAuth()
  const [amount, setAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [requirements, setRequirements] = useState<WithdrawalRequirement | null>(null)
  const [loading, setLoading] = useState(true)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true)

  const minWithdraw = 1

  // Fetch withdrawal requirements
  const fetchRequirements = async () => {
    try {
      setLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005'
      const response = await axios.get(`${apiUrl}/api/withdrawal-requirements`, { withCredentials: true })
      if (response.data.success) {
        setRequirements(response.data.requirements)
      }
    } catch (error) {
      console.error('Failed to fetch requirements:', error)
      // Enhanced error handling for requirements
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('❌ Authentication Required\n\n🔐 Please log in to view withdrawal requirements.')
        } else {
          alert('❌ Failed to Load Requirements\n\n🔄 Please refresh the page or try again later.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch withdrawal history
  const fetchWithdrawals = async () => {
    try {
      setWithdrawalsLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005'
      const response = await axios.get(`${apiUrl}/api/withdrawal-history`, { withCredentials: true })
      if (response.data.success) {
        setWithdrawals(response.data.withdrawals)
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
      // Enhanced error handling for withdrawals
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('❌ Authentication Required\n\n🔐 Please log in to view withdrawal history.')
        } else {
          alert('❌ Failed to Load Withdrawal History\n\n🔄 Please refresh the page or try again later.')
        }
      }
    } finally {
      setWithdrawalsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequirements()
    fetchWithdrawals()
  }, [])

  const handleWithdraw = async () => {
    if (!requirements?.allRequirementsMet) {
      alert(`❌ Withdrawal Requirements Not Met

📋 You must meet all withdrawal conditions first:

✅ Deposit minimum $10
✅ Refer 1 confirmed friend (every 15 days)  
✅ Participate in Lucky Draw (every 15 days)

💡 Check the requirements section above to see what you need to complete.`)
      return
    }

    if (Number.parseFloat(amount) < minWithdraw) {
      alert(`❌ Invalid Withdrawal Amount

💰 Minimum withdrawal amount: $${minWithdraw}
💡 Please enter an amount of $${minWithdraw} or more.`)
      return
    }

    const totalBalance = user?.totalBalance || 0;
    if (Number.parseFloat(amount) > totalBalance) {
      alert(`❌ Insufficient Balance

💳 Your total balance: $${totalBalance.toFixed(2)}
💰 Requested amount: $${Number.parseFloat(amount).toFixed(2)}
💡 You need to deposit more funds to complete this withdrawal.`)
      return
    }

    if (!walletAddress) {
      alert(`❌ Wallet Address Required

🏦 Please enter your Binance wallet address.
💡 Only USDT (TRC-20) withdrawals are supported.`)
      return
    }

    setIsProcessing(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005'
      const response = await axios.post(`${apiUrl}/api/withdrawal-request`, {
        amount: Number.parseFloat(amount),
        walletAddress
      }, {
        withCredentials: true
      })

      if (response.data.success) {
        setAmount("")
        setWalletAddress("")
        
        // Enhanced success message with better UX
        const successMessage = `🎉 Withdrawal Request Submitted Successfully!

💰 Amount: $${Number.parseFloat(amount).toFixed(2)}
🏦 Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}
⏰ Processing Time: 24-48 hours
📧 You'll receive email updates on your withdrawal status

Your withdrawal request has been queued and will be processed by our admin team. You can track the status in your withdrawal history below.`
        
        alert(successMessage)
        
        // Refresh requirements and withdrawals after successful withdrawal
        fetchRequirements()
        fetchWithdrawals()
      }
    } catch (error: unknown) {
      let errorMessage = 'Failed to submit withdrawal request'
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const serverError = error.response?.data?.error
        
        switch (status) {
          case 400:
            if (serverError?.includes('Minimum withdrawal')) {
              errorMessage = `❌ ${serverError}\n\n💡 Please enter an amount of $1 or more.`
            } else if (serverError?.includes('Insufficient balance')) {
              const totalBalance = user?.totalBalance || 0;
              errorMessage = `❌ ${serverError}\n\n💡 Your total balance is $${totalBalance.toFixed(2)}.\n💰 You need to deposit more funds to meet the minimum withdrawal amount.`
            } else if (serverError?.includes('withdrawal requirements')) {
              errorMessage = `❌ ${serverError}\n\n📋 You need to meet all withdrawal requirements:\n• Deposit at least $10\n• Refer 1 friend who deposits $10\n• Participate in Lucky Draw\n\nCheck the requirements section above for details.`
            } else {
              errorMessage = `❌ ${serverError || 'Invalid request data'}\n\n💡 Please check your input and try again.`
            }
            break
          case 401:
            errorMessage = `❌ Authentication Required\n\n🔐 Please log in to submit withdrawal requests.\n💡 If you're already logged in, try refreshing the page.`
            break
          case 403:
            errorMessage = `❌ Access Denied\n\n🚫 You don't have permission to submit withdrawal requests.\n💡 Contact support if you believe this is an error.`
            break
          case 500:
            errorMessage = `❌ Server Error\n\n🔄 Our servers are experiencing issues.\n💡 Please try again in a few minutes or contact support.`
            break
          default:
            errorMessage = `❌ ${serverError || 'An unexpected error occurred'}\n\n💡 Please try again or contact support if the problem persists.`
        }
      } else if (error instanceof Error) {
        errorMessage = `❌ ${error.message}\n\n💡 Please check your connection and try again.`
      }
      
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const conditions = [
    {
      label: "Deposit minimum $10",
      met: requirements?.requirements.deposit.met || false,
      description: `Current deposit: $${requirements?.requirements.deposit.completed || 0} (minimum $10 required)`,
    },
    {
      label: "Refer 1 confirmed friend (every 15 days)",
      met: requirements?.requirements.referrals.met || false,
      description: `Confirmed referrals this period: ${requirements?.requirements.referrals.completed || 0}/1 (friend must deposit $10 and have it confirmed)`,
    },
    {
      label: "Participate in Lucky Draw (every 15 days)",
      met: requirements?.requirements.luckyDraw.met || false,
      description: `Lucky draw participation this period: ${requirements?.requirements.luckyDraw.completed || 0}/1`,
    },
  ]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading withdrawal requirements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
            <p className="text-gray-600 mt-2">Request a withdrawal to your Binance wallet</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              fetchRequirements()
              fetchWithdrawals()
            }}
            disabled={loading || withdrawalsLoading}
            className="ml-2"
          >
            {loading || withdrawalsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <span>Refresh</span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Withdrawal Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requirements</CardTitle>
            <CardDescription>
              You must meet all conditions below to withdraw funds. Requirements reset every 15 days.
              {requirements && (
                <span className="block text-sm text-blue-600 mt-1">
                  {requirements.daysLeft > 0 
                    ? `${requirements.daysLeft} days left in current 15-day period`
                    : '15-day period ended - requirements reset'
                  }
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    condition.met ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {condition.met ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${condition.met ? "text-green-800" : "text-red-800"}`}>
                    {condition.label}
                  </p>
                  <p className="text-sm text-gray-600">{condition.description}</p>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-900 mb-2">Current Balance</h4>
              <div className="text-2xl font-bold text-blue-600">${user?.totalBalance?.toFixed(2) || '0.00'}</div>
              <p className="text-sm text-blue-700 mt-1">Available for withdrawal</p>
            </div>

            {requirements?.balanceReset && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Balance Reset</p>
                    <p>Your balance was reset to $0 because you didn't meet the requirements in the previous 15-day period.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-2">⚠️ Important: Withdrawal Requirements</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Minimum deposit:</strong> You must have deposited at least $10</li>
                    <li><strong>Referral requirement:</strong> Refer 1 friend who deposits $10 and has it confirmed by admin every 15 days</li>
                    <li><strong>Lucky draw:</strong> Participate in the lucky draw once every 15 days</li>
                    <li className="text-red-700 font-medium"><strong>Failure to meet requirements will reset your balance to $0</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Banknote className="h-5 w-5 mr-2" />
              Request Withdrawal
            </CardTitle>
            <CardDescription>Minimum withdrawal: ${minWithdraw}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={minWithdraw}
                step="0.01"
              />
              <p className="text-sm text-gray-600">
                Minimum: ${minWithdraw} | Available: ${user?.totalBalance?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet">Binance Wallet Address</Label>
              <Input
                id="wallet"
                placeholder="Enter your Binance wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
              <p className="text-sm text-gray-600">
                Only USDT (TRC-20) withdrawals supported
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Minimum withdrawal: $1</li>
                    <li>Processing time: 24-48 hours</li>
                    <li>Only USDT (TRC-20) withdrawals</li>
                    <li>Double-check your wallet address</li>
                    <li>Withdrawal fees may apply</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={!requirements?.allRequirementsMet || !amount || Number.parseFloat(amount) < minWithdraw || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Request Withdrawal"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Withdrawals */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Withdrawals</CardTitle>
          <CardDescription>Your withdrawal history</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading withdrawal history...</p>
            </div>
          ) : withdrawals.length > 0 ? (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">USDT Withdrawal</p>
                    <p className="text-sm text-gray-600">
                      {new Date(withdrawal.createdAt).toLocaleDateString()} • {withdrawal.status}
                    </p>
                    {withdrawal.notes && (
                      <p className="text-xs text-gray-500 mt-1">{withdrawal.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-${withdrawal.amount.toFixed(2)}</p>
                    <span className={`text-xs ${
                      withdrawal.status === 'completed' ? 'text-green-600' :
                      withdrawal.status === 'rejected' ? 'text-red-600' :
                      withdrawal.status === 'processing' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Banknote className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No withdrawals yet. Meet the requirements to start withdrawing!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
