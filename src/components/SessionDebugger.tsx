import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sessionManager } from '@/lib/sessionManager';
import { useAuth } from '@/hooks/useAuth';
import { RefreshCw, LogOut, Info } from 'lucide-react';

/**
 * SessionDebugger - Debug component to test persistent login system
 * Add this to Settings page or any page for testing
 */
export const SessionDebugger = () => {
  const { user, signOut } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadSessionInfo = async () => {
    setLoading(true);
    const info = await sessionManager.getSessionInfo();
    setSessionInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    loadSessionInfo();
  }, [user]);

  const handleUpdateLastActive = async () => {
    await sessionManager.updateLastActive();
    await loadSessionInfo();
  };

  const handleClearSession = async () => {
    await signOut();
    await loadSessionInfo();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getDaysRemaining = () => {
    if (!sessionInfo?.userData?.loginTimestamp) return 0;
    const loginTime = sessionInfo.userData.loginTimestamp;
    const expiryTime = loginTime + (7 * 24 * 60 * 60 * 1000);
    const remaining = expiryTime - Date.now();
    return Math.max(0, Math.floor(remaining / (24 * 60 * 60 * 1000)));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Session Debug Info
        </CardTitle>
        <CardDescription>
          Persistent login system status and details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={sessionInfo?.isLoggedIn ? "default" : "secondary"}>
            {sessionInfo?.isLoggedIn ? "✅ Logged In" : "❌ Not Logged In"}
          </Badge>
          <Badge variant={sessionInfo?.isExpired ? "destructive" : "default"}>
            {sessionInfo?.isExpired ? "⚠️ Expired" : "✅ Active"}
          </Badge>
          <Badge variant="outline">
            🔐 {getDaysRemaining()} days remaining
          </Badge>
        </div>

        {/* User Data */}
        {sessionInfo?.userData && (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Email:</div>
              <div className="text-muted-foreground">{sessionInfo.userData.email}</div>
              
              <div className="font-semibold">User ID:</div>
              <div className="text-muted-foreground font-mono text-xs">
                {sessionInfo.userData.userId.substring(0, 20)}...
              </div>
              
              <div className="font-semibold">Login Time:</div>
              <div className="text-muted-foreground">
                {formatDate(sessionInfo.userData.loginTimestamp)}
              </div>
              
              <div className="font-semibold">Last Active:</div>
              <div className="text-muted-foreground">
                {formatDate(sessionInfo.userData.lastActive)}
              </div>
              
              <div className="font-semibold">Session Expiry:</div>
              <div className="text-muted-foreground">
                {sessionInfo.sessionExpiryDays} days
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={loadSessionInfo}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Info
          </Button>
          
          <Button
            onClick={handleUpdateLastActive}
            variant="outline"
            size="sm"
          >
            Update Last Active
          </Button>
          
          {sessionInfo?.isLoggedIn && (
            <Button
              onClick={handleClearSession}
              variant="destructive"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Clear Session
            </Button>
          )}
        </div>

        {/* Storage Keys Info */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <div className="font-semibold mb-2">Storage Keys:</div>
          <ul className="space-y-1 font-mono">
            <li>• primeflex-user-session</li>
            <li>• primeflex-user-data</li>
            <li>• primeflex-last-active</li>
            <li>• primeflex-login-timestamp</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
