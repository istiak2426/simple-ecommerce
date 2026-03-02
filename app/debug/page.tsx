"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clientEnv, setClientEnv] = useState({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug-env');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Failed to fetch debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading debug info...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Environment Debug Page</h1>

      {/* Client-side env check */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Client-side Environment:</h2>
        <div className="space-y-1">
          <p>
            <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL:</span>{' '}
            {clientEnv.NEXT_PUBLIC_SUPABASE_URL ? (
              <span className="text-green-600">✅ {clientEnv.NEXT_PUBLIC_SUPABASE_URL}</span>
            ) : (
              <span className="text-red-600">❌ Not set</span>
            )}
          </p>
        </div>
      </div>

      {/* Server-side debug info */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Server Information:</h2>
          <p><span className="font-mono">Environment:</span> {debugInfo.environment}</p>
          <p><span className="font-mono">Working Directory:</span> {debugInfo.cwd}</p>
          <p><span className="font-mono">Timestamp:</span> {debugInfo.timestamp}</p>
        </div>

        {debugInfo.envFile && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">.env.local File Check:</h2>
            <p>Path: {debugInfo.envFile.path}</p>
            <p>File exists: {debugInfo.envFile.exists ? '✅' : '❌'}</p>
            {debugInfo.envFile.variables && (
              <div className="mt-2">
                <p className="font-semibold">Variables found in file:</p>
                <ul className="list-disc pl-5">
                  {debugInfo.envFile.variables.map((v: any, i: number) => (
                    <li key={i} className="font-mono">{v.key}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Process Environment Variables:</h2>
          <div className="space-y-2">
            <div className="p-2 bg-white rounded">
              <p className="font-semibold">NEXT_PUBLIC_SUPABASE_URL:</p>
              <p>Exists: {debugInfo.processEnv?.NEXT_PUBLIC_SUPABASE_URL?.exists ? '✅' : '❌'}</p>
              {debugInfo.processEnv?.NEXT_PUBLIC_SUPABASE_URL?.value && (
                <p>Value preview: {debugInfo.processEnv.NEXT_PUBLIC_SUPABASE_URL.value}</p>
              )}
            </div>
            
            <div className="p-2 bg-white rounded">
              <p className="font-semibold">SUPABASE_SERVICE_ROLE_KEY:</p>
              <p>Exists: {debugInfo.processEnv?.SUPABASE_SERVICE_ROLE_KEY?.exists ? '✅' : '❌'}</p>
              <p>Length: {debugInfo.processEnv?.SUPABASE_SERVICE_ROLE_KEY?.length}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Common Misspellings Check:</h2>
          <ul className="space-y-1">
            <li>NEXT_PUBLIC_SUPABSE_URL: {debugInfo.processEnv?.NEXT_PUBLIC_SUPABSE_URL ? '✅ Found' : '❌ Not found'}</li>
            <li>NEXT_PUBLIC_SUPABASEURL: {debugInfo.processEnv?.NEXT_PUBLIC_SUPABASEURL ? '✅ Found' : '❌ Not found'}</li>
            <li>SUPABASE_URL: {debugInfo.processEnv?.SUPABASE_URL ? '✅ Found' : '❌ Not found'}</li>
          </ul>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">All Supabase-related env keys:</h2>
          <ul className="list-disc pl-5">
            {debugInfo.allEnvKeys?.map((key: string, i: number) => (
              <li key={i} className="font-mono">{key}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Supabase Connection Test:</h2>
          {debugInfo.supabaseTest ? (
            <div>
              <p>Success: {debugInfo.supabaseTest.success ? '✅' : '❌'}</p>
              {debugInfo.supabaseTest.error && (
                <div className="mt-2 p-2 bg-red-50 rounded">
                  <p>Error: {debugInfo.supabaseTest.error.message}</p>
                  <p>Details: {debugInfo.supabaseTest.error.details}</p>
                  <p>Hint: {debugInfo.supabaseTest.error.hint}</p>
                  <p>Code: {debugInfo.supabaseTest.error.code}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-600">{debugInfo.clientCreation}</p>
          )}
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Quick Fixes:</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Make sure .env.local is in the project root (same folder as package.json)</li>
            <li>Variable name must be exactly: NEXT_PUBLIC_SUPABASE_URL</li>
            <li>No spaces around the = sign: KEY=value (not KEY = value)</li>
            <li>No quotes around the value: KEY=value (not KEY="value")</li>
            <li>Restart the dev server completely after changing .env.local</li>
            <li>Clear browser cache and hard reload (Ctrl+Shift+R)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}