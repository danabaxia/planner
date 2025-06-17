'use client';

import { Calendar, CheckCircle, Clock, Plus } from 'lucide-react'
import { Container, Grid, GridItem, Stack } from '@/components/ui'
import { motion } from 'framer-motion'
import { 
  pageEnter, 
  heroSection, 
  featureCard, 
  staggerContainer, 
  staggerItem,
  textReveal,
  elasticScale 
} from '@/utils/animations'

export default function Home() {
  return (
    <motion.main
      variants={pageEnter}
      initial="hidden"
      animate="visible"
    >
      <Container size="xl" padding="lg">
        {/* Header */}
        <motion.div variants={heroSection}>
          <Stack spacing="xl" className="text-center">
            <Stack spacing="md">
              <motion.h1 
                className="text-4xl font-bold text-gray-900"
                variants={textReveal}
              >
                Daily Activity Planner
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-600"
                variants={textReveal}
              >
                Beautiful Notion-powered planning with Motion-inspired design
              </motion.p>
            </Stack>
            
            <motion.div 
              className="flex justify-center gap-4"
              variants={staggerContainer}
            >
              <motion.button 
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                variants={elasticScale}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                Get Started
              </motion.button>
              <motion.button 
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                variants={elasticScale}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                Learn More
              </motion.button>
            </motion.div>
          </Stack>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="mt-20"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-900 text-center mb-12"
            variants={textReveal}
          >
            Everything you need to stay organized
          </motion.h2>
          
          <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap="lg">
            <GridItem>
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full"
                variants={featureCard}
                whileHover="hover"
              >
                <motion.div 
                  className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4"
                  variants={elasticScale}
                  initial="rest"
                  whileHover="hover"
                >
                  <Calendar className="w-6 h-6 text-primary-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Smart Scheduling
                </h3>
                <p className="text-gray-600">
                  Intelligent activity scheduling that adapts to your preferences and availability.
                </p>
              </motion.div>
            </GridItem>

            <GridItem>
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full"
                variants={featureCard}
                whileHover="hover"
              >
                <motion.div 
                  className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4"
                  variants={elasticScale}
                  initial="rest"
                  whileHover="hover"
                >
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Progress Tracking
                </h3>
                <p className="text-gray-600">
                  Visual progress tracking with detailed insights and completion analytics.
                </p>
              </motion.div>
            </GridItem>

            <GridItem>
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full"
                variants={featureCard}
                whileHover="hover"
              >
                <motion.div 
                  className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4"
                  variants={elasticScale}
                  initial="rest"
                  whileHover="hover"
                >
                  <Clock className="w-6 h-6 text-yellow-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Time Management
                </h3>
                <p className="text-gray-600">
                  Advanced time blocking and duration estimation for optimal productivity.
                </p>
              </motion.div>
            </GridItem>

            <GridItem>
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full"
                variants={featureCard}
                whileHover="hover"
              >
                <motion.div 
                  className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4"
                  variants={elasticScale}
                  initial="rest"
                  whileHover="hover"
                >
                  <Plus className="w-6 h-6 text-purple-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Notion Integration
                </h3>
                <p className="text-gray-600">
                  Seamless integration with your Notion workspace for unified data management.
                </p>
              </motion.div>
            </GridItem>

            <GridItem>
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full"
                variants={featureCard}
                whileHover="hover"
              >
                <motion.div 
                  className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4"
                  variants={elasticScale}
                  initial="rest"
                  whileHover="hover"
                >
                  <Calendar className="w-6 h-6 text-blue-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Calendar Sync
                </h3>
                <p className="text-gray-600">
                  Synchronize with your favorite calendar apps for seamless workflow.
                </p>
              </motion.div>
            </GridItem>

            <GridItem>
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full"
                variants={featureCard}
                whileHover="hover"
              >
                <motion.div 
                  className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4"
                  variants={elasticScale}
                  initial="rest"
                  whileHover="hover"
                >
                  <CheckCircle className="w-6 h-6 text-indigo-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Goal Setting
                </h3>
                <p className="text-gray-600">
                  Set and track personal and professional goals with milestone tracking.
                </p>
              </motion.div>
            </GridItem>
          </Grid>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="mt-20 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Stack spacing="lg">
            <motion.h2 
              className="text-3xl font-bold text-gray-900"
              variants={textReveal}
            >
              Ready to transform your productivity?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              variants={textReveal}
            >
              Join thousands of users who have revolutionized their daily planning with our intelligent activity planner.
            </motion.p>
            <motion.div
              variants={staggerItem}
            >
              <motion.button 
                className="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg"
                variants={elasticScale}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                Start Planning Today
              </motion.button>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>
    </motion.main>
  )
}
