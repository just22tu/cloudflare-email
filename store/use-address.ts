import { create } from "zustand"
import { persist } from "zustand/middleware"
import { EmailAddress } from "@/lib/http-client"

interface AddressStore {
  addresses: EmailAddress[]
  currentAddress: EmailAddress | null
  setAddresses: (addresses: EmailAddress[]) => void
  setCurrentAddress: (address: EmailAddress) => void
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      addresses: [],
      currentAddress: null,
      setAddresses: (addresses) => set({ addresses }),
      setCurrentAddress: (address) => set({ currentAddress: address }),
    }),
    {
      name: 'address-storage',
    }
  )
) 