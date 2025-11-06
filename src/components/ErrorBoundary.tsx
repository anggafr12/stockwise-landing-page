'use client';

import React from "react";

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any) {
    console.error("Boundary error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-[#0F1629] border border-[#1E263A] rounded-xl text-white">
          <h2 className="text-lg font-semibold mb-2">Terjadi kesalahan</h2>
          <p className="text-sm text-gray-300">Silakan reload halaman atau cek log konsol.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
