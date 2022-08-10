// Next Imports
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

// React Imports
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Styles
import styles from '../styles/Home.module.css'
import mdStyles from '../styles/github-markdown.module.css'

// Chakra UI Imports
import {
    Box, CircularProgress, useColorModeValue, Text, Tooltip, Tag, HStack,
    useToast
} from '@chakra-ui/react'

// Msal Imports
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";

// Module Imports
//import { gql_functions as func } from "../utils/gql"
import { rest_functions as func } from "../utils/rest"
import { human_time_diff, error_toast, surface_appropriate_error } from "../utils/misc"
import Footer from "../components/footer"


export default function Home({ user, setUser, dbUser, cacheChecked }) {
    const [articles, setArticles] = useState([]);
    const [isFetched, setIsFetched] = useState(false);
    const toast = useToast()

    // Utility function for (re)fetching articles
    // This function shouldn't change, so useCallback memoizes it to prevent recreation each component render
    const fetch_articles = React.useCallback(async () => {
        try {
            const data = await func.get_all_articles(true);
            setArticles(data);
        } catch (err) {
            surface_appropriate_error(toast, err);
        } finally {
            setIsFetched(true);
        }
    }, [toast])

    // Initial data fetching (wait for cache to be checked)
    useEffect(() => {
        if (!isFetched && cacheChecked) {
            fetch_articles();
        }
    }, [cacheChecked, fetch_articles, isFetched])


    const basecolor = useColorModeValue('whitesmoke', 'gray.800');
    const bgcolor = useColorModeValue('white', 'gray.800');

  return (
      <Box bg={basecolor} className={styles.container}>

          <Head>
              <title>Hawaii-CMS</title>
              <meta name="description" content="Generated by create next app" />
              <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className={styles.main}>
              <Box bg={bgcolor} className={styles.header} boxShadow="md">
                  <h1 className={styles.title}>
                      Welcome to Hawaii-CMS!
                  </h1>

                  <p className={styles.description}>
                      Made with <a href="https://nextjs.org">Next.js</a> and Azure Data API Builder
                  </p>
              </Box>
              <Box p={5}/>
              <div className={styles.grid}>
                  {!isFetched &&
                      <div className={styles.loader}>
                          <CircularProgress isIndeterminate color='green.300' />
                      </div>}
                      {articles.slice(0).reverse().map((article) => (
                          <Box key={article.id} className={styles.card} bg={bgcolor} boxShadow={'lg'}>
                              <div className={styles.post_header} style={{ backgroundColor: (dbUser != null && dbUser.email == article.author_email) ? "#ddf4ff" : "#edf2f7"}}>
                                  <HStack>
                                      <Tooltip label={article.author_email}> 
                                          <Text fontWeight="semibold"> {article.author_name} </Text>
                                      </Tooltip>
                                      <Text> {article.status == "published" ? "published" : "saved"} {human_time_diff(article.published)} ago </Text>
                                  </HStack>
                                  <Tooltip label={new Date(`${article.published}Z`).toLocaleTimeString()}>
                                      <Text> {new Date(`${article.published}Z`).toLocaleDateString()} </Text>
                                  </Tooltip>
                            </div>
                            
                            <div className={mdStyles["markdown-body"]} style={{ padding: "1.5em", borderRadius: "0px 0px 10px 10px" }} >
                                <h1 style={{ fontSize: "2.5em"}}> {article.title} </h1>
                                <ReactMarkdown className={mdStyles["markdown-body"]} remarkPlugins={[remarkGfm]} >
                                    {article.body}
                                </ReactMarkdown>
                            </div>
                        </Box>

                    ))}
              </div>

          </main>
          <Footer/>
      </Box>
  )
}
