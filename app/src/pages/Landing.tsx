import { useEffect } from 'react'
import Hero from '@/components/landing/Hero'
import StatsBand from '@/components/landing/StatsBand'
import HowItWorks from '@/components/landing/HowItWorks'
import VsScreener from '@/components/landing/VsScreener'
import PrivacyPromises from '@/components/landing/PrivacyPromises'
import DayOfService from '@/components/landing/DayOfService'
import Faq from '@/components/landing/Faq'
import FinalCta from '@/components/landing/FinalCta'

export default function Landing() {
  useEffect(() => {
    document.title = 'Money on the Table: benefit applications, ready to sign'
  }, [])
  return (
    <>
      <Hero />
      <HowItWorks />
      <StatsBand />
      <VsScreener />
      <PrivacyPromises />
      <DayOfService />
      <Faq />
      <FinalCta />
    </>
  )
}
